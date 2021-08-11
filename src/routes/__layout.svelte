<script>
  import 'bulma/css/bulma.min.css';
  import '@fortawesome/fontawesome-free/css/all.min.css';
</script>

<nav class="navbar is-transparent is-spaced" role="navigation" aria-label="main navigation">
  <div class="navbar-brand">
    <a class="navbar-item" href="/">
      <img src="/whale.png" alt="Whale" width="48" height="48" />
    </a>
    <div class="navbar-burger" data-target="navbarMenu">
      <span />
      <span />
      <span />
    </div>
  </div>

  <div id="navbarMenu" class="navbar-menu">
    <div class="navbar-start">
      <a class="navbar-item" href="/"> Whale Watcher </a>
      <div class="navbar-item has-dropdown is-hoverable">
        <span class="navbar-link"> Chain </span>
        <div class="navbar-dropdown is-boxed">
          <!--<a class="navbar-item" href="/ethereum"> Ethereum </a>
					<a class="navbar-item" href="/polygon"> Polygon </a>-->
        </div>
      </div>
    </div>

    <div class="navbar-end">
      <div class="navbar-item">
        <span class="button tag is-dark is-medium is-rounded" disabled>
          <span class="icon mr-2"><i class="fas fa-wallet" /></span>
          <span>Connect to Wallet</span>
        </span>
      </div>
    </div>
  </div>
</nav>

<slot />

<style>
  :global(body) {
    width: 100vw;
    min-height: 100vh;
    background-color: #f7f7f7;
  }
  .navbar {
    background-color: #f7f7f7;
  }
  .navbar-item img {
    max-height: 3rem;
  }
</style>
