export async function get(): Promise<unknown> {
  //const { slug } = params
  //console.log(slug)
  //const response = 'world'
  const response = await fetch(
    'https://api.coingecko.com/api/v3/coins/dinoswap?market_data=false&community_data=false&developer_data=false',
  );
  return {
    body: {
      response,
    },
  };
}
