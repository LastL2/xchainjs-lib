import {
  CryptoAmount,
  assetAmount,
  assetFromStringEx,
  assetToBase,
  assetToString,
  baseAmount,
} from '@xchainjs/xchain-util'

import mockMayanodeApi from '../__mocks__/mayanode-api'
import { BtcAsset, EthAsset, RuneAsset } from '../src/'
import { MayachainCache } from '../src/mayachain-cache'
import { MayachainQuery } from '../src/mayachain-query'

describe('Mayachain-query tests', () => {
  let mayachainQuery: MayachainQuery

  beforeAll(() => {
    mockMayanodeApi.init()
    mayachainQuery = new MayachainQuery(new MayachainCache())
  })
  afterAll(() => {
    mockMayanodeApi.restore()
  })

  it('Should fetch BTC to ETH swap', async () => {
    const quoteSwap = await mayachainQuery.quoteSwap({
      amount: new CryptoAmount(assetToBase(assetAmount(1)), BtcAsset),
      fromAsset: BtcAsset,
      destinationAsset: EthAsset,
    })
    expect(quoteSwap.toAddress).toBe('bc1q0cyg49kz2u982x0m57f8ces0296s04wedddrcs')
    expect(quoteSwap.memo).toBe('')
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(EthAsset))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('1740667871')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('10000')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(EthAsset))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(EthAsset))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(EthAsset))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('360000')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(1)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(600)
    expect(quoteSwap.outboundDelayBlocks).toBe(248)
    expect(quoteSwap.outboundDelaySeconds).toBe(3720)
    expect(quoteSwap.totalSwapSeconds).toBe(600 + 3720)
    expect(quoteSwap.slipBasisPoints).toBe(189)
    expect(quoteSwap.canSwap).toBe(false)
    expect(quoteSwap.errors.length).toBe(1)
    expect(quoteSwap.warning).toBe('')
  })

  it('Should fetch RUNE to BTC swap', async () => {
    const quoteSwap = await mayachainQuery.quoteSwap({
      fromAsset: RuneAsset,
      destinationAsset: BtcAsset,
      amount: new CryptoAmount(baseAmount('688598892692', 8), BtcAsset),
      fromAddress: 'thor14mh37ua4vkyur0l5ra297a4la6tmf95mt96a55',
      destinationAddress: 'bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj',
      affiliateAddress: 'maya17hwqt302e5f2xm4h95ma8wuggqkvfzgvsyfc54',
      affiliateBps: 1000,
    })
    expect(quoteSwap.toAddress).toBe('thor10cyg49kz2u982x0m57f8ces0296s04weas2nfz')
    expect(quoteSwap.memo).toBe(
      '=:BTC.BTC:bc1qxhmdufsvnuaaaer4ynz88fspdsxq2h9e9cetdj::maya17hwqt302e5f2xm4h95ma8wuggqkvfzgvsyfc54:1000',
    )
    expect(assetToString(quoteSwap.expectedAmount.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.expectedAmount.baseAmount.amount().toString()).toBe('86790283')
    expect(quoteSwap.expectedAmount.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.dustThreshold.asset)).toBe(assetToString(RuneAsset))
    expect(quoteSwap.dustThreshold.baseAmount.amount().toString()).toBe('0')
    expect(quoteSwap.dustThreshold.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.asset)).toBe(assetToString(BtcAsset))
    expect(assetToString(quoteSwap.fees.affiliateFee.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.fees.affiliateFee.baseAmount.amount().toString()).toBe('9652531')
    expect(quoteSwap.fees.affiliateFee.baseAmount.decimal).toBe(8)
    expect(assetToString(quoteSwap.fees.outboundFee.asset)).toBe(assetToString(BtcAsset))
    expect(quoteSwap.fees.outboundFee.baseAmount.amount().toString()).toBe('82500')
    expect(quoteSwap.fees.outboundFee.baseAmount.decimal).toBe(8)
    expect(quoteSwap.inboundConfirmationBlocks).toBe(undefined)
    expect(quoteSwap.inboundConfirmationSeconds).toBe(undefined)
    expect(quoteSwap.outboundDelayBlocks).toBe(225)
    expect(quoteSwap.outboundDelaySeconds).toBe(135000)
    expect(quoteSwap.totalSwapSeconds).toBe(0 + 135000)
    expect(quoteSwap.slipBasisPoints).toBe(83)
    expect(quoteSwap.canSwap).toBe(true)
    expect(quoteSwap.errors.length).toBe(0)
    expect(quoteSwap.warning).toBe('')
  })

  it('Should return the number of decimals of Mayachain assets', async () => {
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('BTC.BTC'))).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('BTC/BTC'))).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('ETH.ETH'))).toBe(18)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('DASH.DASH'))).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('KUJI.KUJI'))).toBe(6)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('THOR.RUNE'))).toBe(8)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('MAYA.CACAO'))).toBe(8)
    expect(
      await mayachainQuery.getAssetDecimals(assetFromStringEx('ETH.USDT-0xdAC17F958D2ee523a2206206994597C13D831ec7')),
    ).toBe(6)
    expect(
      await mayachainQuery.getAssetDecimals(assetFromStringEx('ETH.USDC-0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48')),
    ).toBe(6)
    expect(
      await mayachainQuery.getAssetDecimals(assetFromStringEx('ETH.WSTETH-0X7F39C581F595B53C5CB19BD0B3F8DA6C935E2CA0')),
    ).toBe(18)
    expect(await mayachainQuery.getAssetDecimals(assetFromStringEx('KUJI.USK'))).toBe(6)
    expect(
      mayachainQuery.getAssetDecimals(assetFromStringEx('ETH.BNB-0xB8c77482e45F1F44dE1745F52C74426C631bDD52')),
    ).rejects.toThrowError('Can not get decimals for ETH.BNB-0xB8c77482e45F1F44dE1745F52C74426C631bDD52')
  })
})
