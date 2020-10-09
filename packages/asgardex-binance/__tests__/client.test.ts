require('dotenv').config()
import { Client as BinanceClient } from '../src/client'
import { AssetBNB, baseAmount, delay } from '@thorchain/asgardex-util'

describe('BinanceClient Test', () => {
  let bnbClient: BinanceClient

  // Note: This phrase is created by https://iancoleman.io/bip39/ and will never been used in a real-world
  const phrase = 'rural bright ball negative already grass good grant nation screen model pizza'
  const mainnetaddress = 'bnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9e738vr'
  const testnetaddress = 'tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj'

  // This needs to be updated once `Fees` type in `asgardex-client` changes
  const transferFee = { type: 'base', average: 37500 }
  const multiSendFee = { type: 'base', average: 30000 }
  const freezeFee = { type: 'base', average: 500000 }

  const transferFeeAmount = baseAmount(transferFee.average)
  const multiSendFeeAmount = baseAmount(multiSendFee.average)
  const freezeFeeAmount = baseAmount(freezeFee.average)
  const transferAmount = baseAmount(1000000)
  const freezeAmount = baseAmount(500000)

  // tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7 is used for testing transaction.
  // it needs to have balances.
  const phraseForTX = 'wheel leg dune emerge sudden badge rough shine convince poet doll kiwi sleep labor hello'
  const testnetaddressForTx = 'tbnb1t95kjgmjc045l2a728z02textadd98yt339jk7'

  beforeEach(async () => {
    bnbClient = new BinanceClient({ phrase, network: 'mainnet' })
  })

  afterEach(async () => {
    bnbClient.purgeClient()
    
    await delay(1000)
  })

  it('should start with empty wallet', async () => {
    const bnbClientEmptyMain = new BinanceClient({ phrase, network: 'mainnet' })
    const addressMain = bnbClientEmptyMain.getAddress()
    expect(addressMain).toEqual(mainnetaddress)
    
    const bnbClientEmptyTest = new BinanceClient({ phrase, network: 'testnet' })
    const addressTest = bnbClientEmptyTest.getAddress()
    expect(addressTest).toEqual(testnetaddress)
  })

  it('throws an error passing an invalid phrase', async () => {
    expect(() => {
      new BinanceClient({ phrase: 'invalid phrase', network: 'mainnet' })
    }).toThrow()
  })

  it('should have right address', async () => {
    expect(bnbClient.getAddress()).toEqual(mainnetaddress)
  })

  it('should update net', () => {
    const client = new BinanceClient({ phrase, network: 'mainnet' })
    client.setNetwork('testnet')
    expect(client.getNetwork()).toEqual('testnet')
    expect(client.getAddress()).toEqual(testnetaddress)
  })

  it('setPhrase should return addres', () => {
    expect(bnbClient.setPhrase(phrase)).toEqual(mainnetaddress)

    bnbClient.setNetwork('testnet')
    expect(bnbClient.setPhrase(phrase)).toEqual(testnetaddress)
  })

  it('should generate phrase', () => {
    const client = new BinanceClient({ phrase, network: 'mainnet' })
    expect(client.getAddress()).toEqual(mainnetaddress)

    client.setPhrase(BinanceClient.generatePhrase())
    expect(client.getAddress()).toBeTruthy()
    expect(client.getAddress()).not.toEqual(mainnetaddress)
  })

  it('should validate address', () => {
    expect(bnbClient.validateAddress(mainnetaddress)).toBeTruthy()

    bnbClient.setNetwork('testnet')
    expect(bnbClient.validateAddress(testnetaddress)).toBeTruthy()
  })

  it('has no balances', async () => {
    const balances = await bnbClient.getBalance('bnb1v8cprldc948y7mge4yjept48xfqpa46mmcrpku')
    expect(balances).toEqual([])
  })

  it('has balances', async () => {
    bnbClient.setNetwork('testnet')

    const balances = await bnbClient.getBalance('tbnb1zd87q9dywg3nu7z38mxdcxpw8hssrfp9htcrvj', AssetBNB)
    expect(balances.length).toEqual(1)

    const amount = balances[0].amount
    const frozenAmount = balances[0].frozenAmount

    expect(amount.amount().isEqualTo(1289087500)).toBeTruthy()
    expect(balances[0].frozenAmount).toBeTruthy()
    if (frozenAmount) {
      expect(frozenAmount.amount().isEqualTo(10000000)).toBeTruthy()
    }
  })

  it('fetches the transfer fees', async () => {
    const fees = await bnbClient.getFees()
    expect(fees).toEqual(transferFee)
  })

  it('fetches the multisend fees', async () => {
    const fees = await bnbClient.getMultiSendFees()
    expect(fees).toEqual(multiSendFee)
  })

  it('fetches the freeze fees', async () => {
    const fees = await bnbClient.getFreezeFees()
    expect(fees).toEqual(freezeFee)
  })

  it('should broadcast a transfer', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetaddressForTx)
    
    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)

    // feeRate should be optional
    const txHash = await client.transfer({ asset: AssetBNB, recipient: testnetaddressForTx, amount: transferAmount })
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)

    const expected = beforeTransfer[0].amount.amount().minus(transferFeeAmount.amount()).isEqualTo(afterTransfer[0].amount.amount())
    expect(expected).toBeTruthy()
  })

  it('should deposit', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetaddressForTx)

    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)
    
    // feeRate should be optional
    const txHash = await client.deposit({ asset: AssetBNB, recipient: testnetaddressForTx, amount: transferAmount })
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)

    const expected = beforeTransfer[0].amount.amount().minus(transferFeeAmount.amount()).isEqualTo(afterTransfer[0].amount.amount())
    expect(expected).toBeTruthy()
  })

  it('should freeze token', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetaddressForTx)

    const beforeFreeze = await client.getBalance()
    expect(beforeFreeze.length).toEqual(1)

    const txHash = await client.freeze({ asset: AssetBNB, amount: freezeAmount})
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction

    const afterFreeze = await client.getBalance()
    expect(afterFreeze.length).toEqual(1)

    let expected = beforeFreeze[0].amount.amount().minus(freezeAmount.amount()).minus(freezeFeeAmount.amount()).isEqualTo(afterFreeze[0].amount.amount())
    expect(expected).toBeTruthy()
    expected = beforeFreeze[0].frozenAmount!.amount().plus(freezeAmount.amount()).isEqualTo(afterFreeze[0].frozenAmount!.amount())
    expect(expected).toBeTruthy()
  })

  it('should unfreeze token', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetaddressForTx)

    const beforeUnFreeze = await client.getBalance()
    expect(beforeUnFreeze.length).toEqual(1)

    const txHash = await client.unfreeze({ asset: AssetBNB, amount: freezeAmount})
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction
    
    const afterUnFreeze = await client.getBalance()
    expect(afterUnFreeze.length).toEqual(1)

    let expected = beforeUnFreeze[0].amount.amount().plus(freezeAmount.amount()).minus(freezeFeeAmount.amount()).isEqualTo(afterUnFreeze[0].amount.amount())
    expect(expected).toBeTruthy()
    expected = beforeUnFreeze[0].frozenAmount!.amount().minus(freezeAmount.amount()).isEqualTo(afterUnFreeze[0].frozenAmount!.amount())
    expect(expected).toBeTruthy()
  })

  it('should broadcast a multi transfer', async () => {
    const client = new BinanceClient({ phrase: phraseForTX, network: 'testnet' })
    expect(client.getAddress()).toEqual(testnetaddressForTx)
    
    const beforeTransfer = await client.getBalance()
    expect(beforeTransfer.length).toEqual(1)

    const transactions = [
      {
        to: testnetaddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: freezeAmount
          }
        ]
      },
      {
        to: testnetaddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: freezeAmount
          }
        ]
      },
      {
        to: testnetaddressForTx,
        coins: [
          {
            asset: AssetBNB,
            amount: freezeAmount
          }
        ]
      }
    ];
    const txHash = await client.multiSend({ transactions })
    expect(txHash).toEqual(expect.any(String))
    await delay(1000) //delay after transaction

    const afterTransfer = await client.getBalance()
    expect(afterTransfer.length).toEqual(1)

    const expected = beforeTransfer[0].amount.amount().minus(multiSendFeeAmount.amount().multipliedBy(transactions.length)).isEqualTo(afterTransfer[0].amount.amount())
    expect(expected).toBeTruthy()
  })

  it('has an empty tx history', async () => {
    const txArray = await bnbClient.getTransactions()
    expect(txArray).toEqual({ total: 0, txs: [] })
  })

  it('has tx history', async () => {
    bnbClient.setNetwork('testnet')

    const txArray = await bnbClient.getTransactions({ address: testnetaddressForTx })
    expect(txArray.total).toBeTruthy()
    expect(txArray.txs.length).toBeTruthy()
  })
})