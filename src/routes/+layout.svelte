<script>
    import '../global.css';
</script>

<header>
    <hgroup>
    <h1>Manticore</h1>
    <h2><em>13th Age</em> fair encounter generator</h2>
    </hgroup>

    <div class="blurb">
        <img class="logo" src="images/logo.png" alt="illustration of a manticore">

        <p>
        <em>Manticore</em> implements the rules for <em>Building
            Battles</em> on page 186 of
        your <em>13th Age</em> core rulebook, in particular the
        pricing table. This application will automatically produce a
        set of all &ndash; within reason &ndash; encounter
        combinations that are allowed for a given party and
        selection of monsters.
        </p>
        
        <p class="unfair">
        To produce an unfair encounter, refer to the guidelines on
        page 187 of your rulebook to modify a fair encounter
        generated by this app.
        </p>
    </div>
</header>

<slot></slot>

<footer>       
    <div>
      <section class="fire-opal">
        <p>
          This program uses trademarks and/or copyrights owned by Fire Opal
          Media, which are used under the Fire Opal Media, 13th Age Community
          Use Policy. We are expressly prohibited from charging you to use or
          access this content. This program is not published, endorsed, or
          specifically approved by Fire Opal Media. For more information about
          Fire Opal Media's 13th Age Community Use Policy, please
          visit <a href="https://www.fireopalmedia.com/communityuse">www.fireopalmedia.com/communityuse</a>.
          For more information about Fire Opal Media and <em>13th Age</em>
          products, please
          visit <a href="https://www.fireopalmedia.com">www.fireopalmedia.com</a>
          and <a href="https://www.pelgranepress.com">www.pelgranepress.com</a>.
        </p>
      </section>
  
      <section class="code">
        <p>
          <a href="https://github.com/brehaut/manticore">Source code</a>
          copyright © 2014&ndash;2023 <a href="https://brehaut.net/">Andrew
            Brehaut</a>
        </p>
      </section>
  
      <section class="illustration">
        <p>
          Manticore illustration copyright &copy; 2014 <a href="https://blog.trilemma.com">Michael
            Prescott</a>, used with permission. You can find more of
          Michael’s work, including his series of <a href="https://www.patreon.com/adventures">One Page Dungeons</a>,
          on <a href="https://blog.trilemma.com">his blog</a>.
        </p>
      </section>
  
      <section class="alegreya">
        <p>
          Alegreya font copyright &copy; 2011, Juan Pablo del Peral (juan@huertatipografica.com.ar), 
          with Reserved Font Names "Alegreya" "Alegreya SC"
        </p>
        <p>
          This Font Software is licensed under the SIL Open Font License, Version 1.1.
        </p>
      </section>

      <!-- svelte-ignore missing-declaration -->
      <div>Version: { __APP_VERSION__ }</div>

    </div>
  </footer>    