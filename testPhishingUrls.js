const axios = require("axios");

// Replace this with your first 20 phishing URLs
const urls = [
  "nobell.it/70ffb52d079109dca5664cce6f317373782/login.SkyPe.com/en/cgi-bin/verification/login/70ffb52d079109dca5664cce6f317373/index.php?cmd=_profile-ach&outdated_page_tmpl=p/gen/failed-to-load&nav=0.5.1&login_access=1322408526",
  "www.dghjdgf.com/paypal.co.uk/cycgi-bin/webscrcmd=_home-customer&nav=1/loading.php",
  "serviciosbys.com/paypal.cgi.bin.get-into.herf.secure.dispatch35463256rzr321654641dsf654321874/href/href/href/secure/center/update/limit/seccure/4d7a1ff5c55825a2e632a679c2fd5353/",
  "mail.printakid.com/www.online.americanexpress.com/index.html",
  "thewhiskeydregs.com/wp-content/themes/widescreen/includes/temp/promocoessmiles/?84784787824HDJNDJDSJSHD//2724782784/",
  "smilesvoegol.servebbs.org/voegol.php",
  "premierpaymentprocessing.com/includes/boleto-2via-07-2012.php",
  "myxxxcollection.com/v1/js/jih321/bpd.com.do/do/l.popular.php",
  "super1000.info/docs",
  "horizonsgallery.com/js/bin/ssl1/_id/www.paypal.com/fr/cgi-bin/webscr/cmd=_registration-run/login.php?cmd=_login-run&amp;dispatch=1471c4bdb044ae2be9e2fc3ec514b88b1471c4bdb044ae2be9e2fc3ec514b88b",
  "phlebolog.com.ua/libraries/joomla/results.php",
  "docs.google.com/spreadsheet/viewform?formkey=dE5rVEdSV2pBdkpSRy11V3o2eDdwbnc6MQ",
  "www.coincoele.com.br/Scripts/smiles/?pt-br/Paginas/default.aspx",
  "www.henkdeinumboomkwekerij.nl/language/pdf_fonts/smiles.php",
  "perfectsolutionofall.net/wp-content/themes/twentyten/wiresource/",
  "lingshc.com/old_aol.1.3/?Login=&amp;Lis=10&amp;LigertID=1993745&amp;us=1",
  "anonymeidentity.net/remax./remax.htm",
  "dutchweb.gtphost.com/zimbra/exch/owa/uleth/index.html",
  "www.avedeoiro.com/site/plugins/chase/",
  "asladconcentration.com/paplkuk1/webscrcmd=_home-customer&nav=1/",
];

// Function to test all URLs
async function testUrls() {
  for (let i = 0; i < urls.length; i++) {
    try {
      const response = await axios.post("http://localhost:5000/predict", {
        url: urls[i],
      });
      console.log(`${i + 1}. ${urls[i]} => ${response.data.prediction} (Source: ${response.data.source})`);
    } catch (err) {
      console.error(`${i + 1}. ${urls[i]} => ❌ Error:`, err.message);
    }
  }
}

testUrls();
