<script context="module" lang="ts">
  /*export async function load({ page, fetch, session, context }) {
    const url = 'https://api.coingecko.com/api/v3/coins/dinoswap?&community_data=false&developer_data=false'
    let res = await fetch(url)

    if (res.ok) {
      return {
        props: {
          token: await res.json()
        }
      }
    }
    return {
      status: res.status,
      error: new Error(`Could not load ${url}`)
    }

  }*/
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  import { ethers } from 'ethers';
  const rpcURL = 'https://rpc-mainnet.maticvigil.com';
  //const wssURL: string = 'wss://ws-matic-mainnet.chainstacklabs.com'
  const provider = new ethers.providers.JsonRpcProvider(rpcURL);
  //const providerWss = new ethers.providers.WebSocketProvider(wssURL, 137)

  type Whale = {
    time: string;
    tokens: string;
    price: string;
    pt: string;
    dir: string;
  };

  //const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

  const pair = new ethers.Contract(
    '0x3324af8417844e70b81555A6D1568d78f4D4Bf1f',
    [
      'event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)',
    ],
    provider,
  );

  const getCoingecko = async (coin: string): Promise<unknown> => {
    const url = `https://api.coingecko.com/api/v3/coins/${coin}?&community_data=false&developer_data=false`;
    return await fetch(url)
      .then((response) => response.json())
      .then((token) => {
        return token;
      });
  };

  //let token
  let tokenPrice = '';
  let whales = [];
  const maxWhales = 6;
  const maxPrice = 10000;

  const addWhales = (whale: Whale): void => {
    let _whales = [...whales];
    _whales.push(whale);
    if (_whales.length > maxWhales) _whales.shift();
    whales = _whales;
  };

  const setTokenPrice = (price: string): void => {
    tokenPrice = price;
  };

  const listen = async () => {
    pair.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to) => {
      let price: number, text: string;

      const date = new Date();

      const amount0In_ = Number(ethers.utils.formatUnits(amount0In, 6));
      const amount1In_ = Number(ethers.utils.formatUnits(amount1In, 18));
      const amount0Out_ = Number(ethers.utils.formatUnits(amount0Out, 6));
      const amount1Out_ = Number(ethers.utils.formatUnits(amount1Out, 18));

      // assumption that amount0In is not the token
      // TODO, figure out which one is token

      if (sender.toUpperCase() === '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'.toUpperCase())
        sender = 'SUSHISWAP_ROUTER';
      if (sender.toUpperCase() === '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff'.toUpperCase())
        sender = 'QUICKSWAP_ROUTER';

      if (amount0In.isZero()) {
        // Selling Token
        // amount0Out_ USDC
        if (amount0Out_ > 1) {
          price = amount0Out_ / amount1In_;
          setTokenPrice(usd.format(price));
        }
        if (amount0Out_ < maxPrice) return;
        text = ` Sender: ${sender} To: ${to} Tokens: ${amount1In_.toFixed(4)} Price: ${usd.format(
          amount0Out_,
        )} Price/Token: ${usd.format(price)} SELL`;
        //text = await whaleWatch(text, amount0Out_)
        console.log(text);
        /*whales.update((n) => {
          let array = $whales
          array.push({ tokens: amount1In_.toFixed(4), price: usd.format(amount0Out_), pt: usd.format(price), dir: 'sell' })
          return array
        })*/
        addWhales({
          time: date.toLocaleTimeString('en-US'),
          tokens: amount1In_.toFixed(4),
          price: usd.format(amount0Out_),
          pt: usd.format(price),
          dir: 'sell',
        });
      } else {
        // Buying Token
        // amount0In_ USDC
        if (amount0In_ > 1) {
          price = amount0In_ / amount1Out_;
          setTokenPrice(usd.format(price));
        }
        if (amount0In_ < maxPrice) return;
        price = amount0In_ / amount1Out_;
        text = ` Sender: ${sender} To: ${to} Tokens: ${amount1Out_.toFixed(4)} Price: ${usd.format(
          amount0In_,
        )} Price/Token: ${usd.format(price)} BUY`;
        //text = await whaleWatch(text, amount0In_)
        console.log(text);
        /*whales.update((n) => {
          let array = $whales
          array.push({ tokens: amount1Out_.toFixed(4), price: usd.format(amount0In_), pt: usd.format(price), dir: 'buy' })
          return array
        })*/
        addWhales({
          time: date.toLocaleTimeString('en-US'),
          tokens: amount1Out_.toFixed(4),
          price: usd.format(amount0In_),
          pt: usd.format(price),
          dir: 'buy',
        });
      }
    });
  };

  const usd = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 2, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 2, // (causes 2500.99 to be printed as $2,501)
  });

  const wholeNumber = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    currency: 'USD',

    // These options are needed to round to whole numbers if that's what you want.
    minimumFractionDigits: 0, // (this suffices for whole numbers, but will print 2500.10 as $2,500.1)
    maximumFractionDigits: 0, // (causes 2500.99 to be printed as $2,501)
  });

  onMount(async () => {
    listen();
  });
</script>

<section class="section">
  <div class="container">
    <div class="columns">
      <div class="column">
        {#await getCoingecko('dinoswap')}
          loading...
        {:then token}
          <div class="block">
            <div class="level-left">
              <a href={token.links.blockchain_site[0]} target="_blank">
                <figure class="image is-24x24 mr-1">
                  <img class="is-rounded" src="tokens/dinoswap_32.png" alt="DINO" />
                </figure>
              </a>
              <p class="subtitle is-5">
                <a href={token.links.blockchain_site[0]} target="_blank">DINO</a> Price
              </p>
            </div>
            <p class="title is-1">
              {#if !tokenPrice}
                ${token.market_data.current_price.usd}
              {:else}
                {tokenPrice}
              {/if}
            </p>
          </div>
          <div class="block">
            <p class="subtitle">Total Supply</p>
            <p class="title is-3">{wholeNumber.format(token.market_data.total_supply)}</p>
          </div>
          <div class="block">
            <p class="subtitle">Market Cap</p>
            <p class="title is-3">
              {usd.format(token.market_data.current_price.usd * token.market_data.total_supply)}
            </p>
          </div>
          <div class="block">
            <p>
              <a href={token.links.homepage[0]} target="_blank"
                >{token.links.homepage[0].match(/[a-zA-Z]*\.[a-zA-Z]*/g)}</a
              >
              <a href="https://twitter.com/{token.links.twitter_screen_name}" target="_blank"
                ><span class="icon has-text-link"><i class="fab fa-twitter" /></span></a
              >
              <a href={token.links.chat_url[0]} target="_blank"
                ><span class="icon has-text-link"><i class="fab fa-discord" /></span></a
              >
              <a href="https://t.me/{token.links.telegram_channel_identifier}" target="_blank"
                ><span class="icon has-text-link"><i class="fab fa-telegram-plane" /></span></a
              >
              <a href="https://docs.dinoswap.exchange/" target="_blank"
                ><span class="icon has-text-link"><i class="fas fa-book" /></span></a
              >
              <a href="https://github.com/DinoSwap" target="_blank"
                ><span class="icon has-text-link"><i class="fab fa-github" /></span></a
              >
            </p>
          </div>
        {/await}
      </div>
      <div class="column is-two-thirds">
        <!--<div class="box level">
          <div class="level-item">
            <span class="heading">Price</span>
            <span class="title">$0.02</span>
          </div>
          <div class="level-item">
            <p class="heading">Tokens</p>
            <p class="title has-text-danger">0.0094</p>
          </div>
          <div class="level-item">
            <p class="heading">Price</p>
            <p class="title has-text-danger">$0.02</p>
          </div>
          <div class="level-item">
            <p class="heading">Price/Token</p>
            <p class="title has-text-danger">$2.46</p>
            <span class="icon is-large has-text-danger"><i class="fas fa-arrow-down fa-2x" /></span>
          </div>
          <div class="level-right">
            <figure class="image is-32x32">
              <img src="/whale.png" alt="Whale" />
            </figure>
          </div>
				</div>-->
        <!--<div class="field">
          <p class="control has-icons-left has-icons-right">
            <input class="input" type="number" placeholder="minimum dollar amount to watch for">
            <span class="icon is-small is-left">
              <i class="fas fa-dollar-sign"></i>
            </span>
          </p>
        </div>-->
        {#each [...whales].reverse() as whale}
          <div class="box level" transition:fade={{ delay: 250, duration: 300 }}>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">Time</p>
                <p class="title">{whale.time}</p>
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">Tokens</p>
                {#if whale.dir === 'buy'}
                  <p class="title has-text-success">{whale.tokens}</p>
                {:else}
                  <p class="title has-text-danger">{whale.tokens}</p>
                {/if}
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">Price</p>
                {#if whale.dir === 'buy'}
                  <p class="title has-text-success">{whale.price}</p>
                {:else}
                  <p class="title has-text-danger">{whale.price}</p>
                {/if}
              </div>
            </div>
            <div class="level-item has-text-centered">
              <div>
                <p class="heading">Price/Token</p>
                {#if whale.dir === 'buy'}
                  <p class="title has-text-success" transition:fade={{ delay: 250, duration: 300 }}>
                    {whale.pt}
                  </p>
                {:else}
                  <p class="title has-text-danger" transition:fade={{ delay: 250, duration: 300 }}>
                    {whale.pt}
                  </p>
                {/if}
              </div>
            </div>
            <div class="level-right">
              <div class="level-item">
                {#if whale.dir === 'buy'}
                  <span
                    class="icon is-large has-text-success"
                    transition:fade={{ delay: 250, duration: 300 }}
                    ><i class="fas fa-arrow-up fa-2x" /></span
                  >
                {:else}
                  <span
                    class="icon is-large has-text-danger"
                    transition:fade={{ delay: 250, duration: 300 }}
                    ><i class="fas fa-arrow-down fa-2x" /></span
                  >
                {/if}
              </div>
              <div class="level-item">
                <figure class="image is-32x32">
                  <img src="/whale.png" alt="Whale" />
                </figure>
              </div>
            </div>
          </div>
        {/each}
        <!--<div class="box">
          <table class="table is-fullwidth">
            <thead>
              <tr>
                <th>Time</th>
                <th>Tokens</th>
                <th>Price</th>
                <th>Price/Token</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>3:34 PM</td>
                <td class="has-text-success">0.0094</td>
                <td class="has-text-success">$0.02</td>
                <td class="has-text-success">$2.46 <span class="icon"><i class="fas fa-arrow-up"/></span></td>
                <td>
                  <figure class="image is-16x16">
                    <img src="/whale.png" alt="Whale" />
                  </figure>
                </td>
              </tr>
              <tr>
                <td>3:34 PM</td>
                <td class="has-text-danger">0.0094</td>
                <td class="has-text-danger">$0.02</td>
                <td class="has-text-danger">$2.46 <span class="icon"><i class="fas fa-arrow-down"/></span></td>
                <td>
                  <figure class="image is-16x16">
                    <img src="/whale.png" alt="Whale" />
                  </figure>
                </td>
              </tr>
            </tbody>
          </table>
        </div>-->
      </div>
    </div>
  </div>
</section>
