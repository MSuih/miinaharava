var mahd_pelitilanteet = {
    kaikki_avattu: 1,
    peli_kesken: 2,
    osui_miinaan: 3
};
var pelitilanne; //mikä vaihe pelissä on käynnissä (kts. mahd_pelitilanteet)
var kenttakoko_x = 12; //pelikentän koko (vasemmalta oikealle)
var kenttakoko_y = 12; //pelikentän koko (ylhäältä alas)
var ruudunkoko = 40; //yhden ruudun koko
var piirtoalusta; // canvas-elementti, johon piirretään
var konteksti; //piirtoalustan konteksti, jonka avulla piirtoalusatlle piirretään
var numerot; //pelin numerot. Nolla on tyhjä kohta ja negatiivinen on miina
var nakyvissa; //mitkä ruuduista on näkyvissä
var merkit; //mitkä ruudut pelaaja on merkinnyt lipuilla
var miinojen_maara = 27; //kuinka monta miinaa kentässä on
var kuva_miina = new Image(); //miinojen kuvatiedosto
var kuva_lippu = new Image(); //lipun kuvatiedosto
var ruutuja_jaljella; //kuinka monta ruutua on avaamatta
var tk_leveys; //tekstikenttä, johon pelaaja on syöttänyt haluamansa leveyden
var tk_korkeus; //tekstikenttä, johon pelaaja on syöttänyt haluamansa korkeuden
var tk_miinat; //tekstikenttä, johon pelaaja on syöttänyt haluamansa miinamäärän
var varit = ["Nolla", "#819FF7", "#64FE2E", "#29088A", "#FE2EF7", "#D7DF01", "#FFBF00", "#000000", "#FF0000"]; //numeroiden värit

//alusta muuttujat
function alustaPeli() {
    //haetaan paikka, johon peli piirretään
    piirtoalusta = document.getElementById("piirtoalusta");
    konteksti = piirtoalusta.getContext("2d");
    //haetaan kuvatiedostot
    kuva_miina.src = "miina.png";
    kuva_lippu.src = "lippu.png";
    //haetaan kentät, johon pelaaja syöttää tiedot
    tk_leveys = document.getElementById("tk_lev");
    tk_korkeus = document.getElementById("tk_kor");
    tk_miinat = document.getElementById("tk_mii");
    //pistetään kenttiin oletusnumerot
    tk_leveys.value = kenttakoko_x;
    tk_korkeus.value = kenttakoko_y;
    tk_miinat.value = miinojen_maara;
}
//palautetaan peli alkuasentoon
function aloitaPeliAlusta() {
    //tarkistetaan kentät
    var ehd_leveys = tk_leveys.value;
    var ehd_korkeus = tk_korkeus.value;
    var ehd_miinat = tk_miinat.value;
    //estetään mahdottomat lukumäärät, jottei peli kaatuisi
    //tarkistetaan myös, että syötetyt arvot on numeroita
    if (!isNaN(parseInt(ehd_leveys))) kenttakoko_x = Math.max(1, Math.floor(ehd_leveys));
    if (!isNaN(parseInt(ehd_korkeus))) kenttakoko_y = Math.max(1, Math.floor(ehd_korkeus));
    if (!isNaN(parseInt(ehd_miinat))) miinojen_maara = Math.min(kenttakoko_x * kenttakoko_y - 1, Math.floor(ehd_miinat));
    //TODO: tähän voisi tehdä maksimitarkastuksen.
    
    //asetetaan pelialusta oikean kokoiseksi
    piirtoalusta.width = kenttakoko_x * ruudunkoko;
    piirtoalusta.height = kenttakoko_y * ruudunkoko;
    //nollataan tilanne
    pelitilanne = mahd_pelitilanteet.peli_kesken;
    //laitetaan kaikki numerot nollaan
    numerot = []; 
    while(numerot.push([]) < kenttakoko_x);
    for (var x = 0; x < kenttakoko_x; x++){
        for (var y = 0; y < kenttakoko_y; y++) {
            numerot[x][y] = 0;
        }
    }
    //pistetään kaikki ruudut piiloon
    nakyvissa = []; 
    while(nakyvissa.push([]) < kenttakoko_x);
    for (var x = 0; x < kenttakoko_x; x++){
        for (var y = 0; y < kenttakoko_y; y++) {
            nakyvissa[x][y] = false;
        }
    }
    //poistetaan kaikki merkit
    merkit = []; 
    while(merkit.push([]) < kenttakoko_x);
    for (var x = 0; x < kenttakoko_x; x++){
        for (var y = 0; y < kenttakoko_y; y++) {
            merkit[x][y] = false;
        }
    }
    //merkataan, kuinka monta ruutua on jäljellä
    ruutuja_jaljella = kenttakoko_x * kenttakoko_y;
    //lisätään miinat kenttään
    arvoMiinat(miinojen_maara);
    piirraAlustalle();
}
//sijoitetaan x määrä miinoja kenttään satunnaisiin sijainteihin
function arvoMiinat(miinojen_maara) {
    //toistetaan, kunnes kaikki ruudut on asetettu
    for (var i = 0; i < miinojen_maara; ) {
        //arvotaan uusi sijainti
        var rx = Math.floor(Math.random() * kenttakoko_x);
        var ry = Math.floor(Math.random() * kenttakoko_y);
        //jos tässä kohtaa ei ole miinaa
        if (numerot[rx][ry] >= 0) {
            //niin laitetaan siihen uusi
            numerot[rx][ry] = -999;
            //päivitetään jäljelläolevia ruutuja
            ruutuja_jaljella--;
            //sitten lisätään jokaiseen ympärillä olevaan ruutuun 1
            var ruudut = getYmpyroivatRuudut(rx, ry);
            for (lk = 0 ; lk < ruudut.length ; lk++) {
                numerot[ruudut[lk].x][ruudut[lk].y] += 1;
            }
            //yksi miina on asetettu
            i++;
        }
    }
}
//palauttaa kaikki ruudun ympärillä olevat kahdeksan ruutua
function getYmpyroivatRuudut(rx, ry) {
    var ruudut = [];
    
    //tarkistetaan jokaisen kanssa, ettei mennä ruudun rajojen ulkopuolelle
    if (rx + 1 < kenttakoko_x) ruudut.push({x: rx + 1, y: ry});
    if (ry + 1 < kenttakoko_y) ruudut.push({x: rx, y: ry + 1});
    if (rx + 1 < kenttakoko_x && ry + 1 < kenttakoko_y) ruudut.push({x: rx + 1, y: ry + 1});
    if (rx > 0) ruudut.push({x: rx - 1, y: ry});
    if (ry > 0) ruudut.push({x: rx, y: ry - 1});
    if (rx + 1 < kenttakoko_x && ry > 0) ruudut.push({x: rx + 1, y: ry - 1});
    if (rx  > 0 && ry + 1 < kenttakoko_y) ruudut.push({x: rx - 1, y: ry + 1});
    if (rx  > 0 && ry > 0) ruudut.push({x: rx - 1, y: ry - 1});
    
    return ruudut;
}
//avaa kaikki ympärillä olevat ruudut
function avaaKaikkiYmparilta(rx, ry) {
    //ruudut, jotka pitää vielä avata
    var avattavat = [];
    //lisätään keskimmäinen ruutu jottei sitä avata uudestaan
    avattavat.push({x: rx, y: ry});
    //lisätään ympärillä olevat ruudut ja aloitetaan niistä
    avattavat = avattavat.concat(getYmpyroivatRuudut(rx, ry));
    //käydään avattavia läpi niin kauan kun niitä riittää
    //aloitetaan indeksistä 1 jotta ensimmäiseksi lisättyä keskimmäistä ruutua ei avattaisi uudestaan turhaan
    for (var i = 1; i < avattavat.length ; i++) {
        //käsiteltävän ruudun koordinaatit
        var ix = avattavat[i].x;
        var iy = avattavat[i].y;
        //jos tämä ruutu oli jo avattu, ei tehdä sille mitään
        if (nakyvissa[ix][iy] === true) continue;
        //avataan se
        nakyvissa[ix][iy] = true;
        merkit[ix][iy] = false;
        //merkitään avatuksi
        ruutuja_jaljella--;
        //jos ruudussa on numero, ei avata sen ympäriltä mitään
        if (numerot[ix][iy] !== 0) continue;
        //lista ympärillä olevista ruuduista, jotka voitaisiin lisätä listaan
        var mahd_lisattavat = getYmpyroivatRuudut(ix, iy);
        //käydään kaikki edellisen listan ruudut ja katsotaan onko ne jo avattavissa
        for (var z = 0; z < mahd_lisattavat.length; z++) {
            var b = false; //oliko tämä ruutu jo avattavissa
            for (var p = 0; p < avattavat.length; p++) {
                if (avattavat[p].x === mahd_lisattavat[z].x && avattavat[p].y === mahd_lisattavat[z].y) {
                    //tämä ruutu on jo listassa, ei lisätä sitä uudestaan
                    b = true;
                    break;
                }
            }
            //jos ruutua ei ollut listassa, lisätään se
            if (b === false) {
                avattavat.push(mahd_lisattavat[z]);
            }
        }
    }
    //kaikki ympärillä olevat on avattu
}
//pelaaja klikkasi ruutua
function klikkaus(event) {
    //varmistetaan että vain me käsittelemme klikkauksen
    event = event || window.event;
    event.preventDefault();
    //jos peli oli jo ohi, ei klikkausta kösitellä
    if (pelitilanne !== mahd_pelitilanteet.peli_kesken) return;
    //lasketaan ruudukon kohdan x- ja y-koordinaatit
    var x = Math.floor((event.pageX - piirtoalusta.offsetLeft) / ruudunkoko);
    var y = Math.floor((event.pageY - piirtoalusta.offsetTop) / ruudunkoko);
    //haetaan näppäin, jota painettiin
    var button = event.button;
    if (event.which === null) {
        button = event.which;
    }
    
    //jos painettiin vasenta eli päänäpääintä
    if (button === 0) {
        //ruutu oli jo avattu
        if (nakyvissa[x][y] === true) return;
        //paljastetaan painettu ruutu
        nakyvissa[x][y] = true;
        merkit[x][y] = false;
        ruutuja_jaljella--;
        //hups, pelaaja klikkasi miinaa
        if (numerot[x][y] < 0) {
            pelitilanne = mahd_pelitilanteet.osui_miinaan;
            piirraAlustalle();
            return;
        }
        //pelaaja klikkasi tyhjää kohtaa
        else if (numerot[x][y] === 0) {
            avaaKaikkiYmparilta(x, y);
        }
        //Jos numero -> se laitetiin jo näkyväksi, ei tehdä muuta
        //Jos pelaaja avasi kaikki ruudut, peli päättyy
        if (ruutuja_jaljella <= 0) {
            pelitilanne = mahd_pelitilanteet.kaikki_avattu;
        }
    }
    //painettiin keskimmäistä näppäintä eli hiiren rullaa
    else if (button === 1) {
        if (!nakyvissa[x][y] || numerot[x][y] === 0) return;
        //lasketaan ympärillä olevien lippujen määrä
        var tarkistettavat = getYmpyroivatRuudut(x, y);
        var lkm = 0;
        for (var i = 0; i < tarkistettavat.length; i++) {
            if (merkit[tarkistettavat[i].x][tarkistettavat[i].y]) lkm++;
        }
        //jos lippujen määrä oli oikea
        if (lkm === numerot[x][y]) {
            //avataan ne, joiss ei ollut lippua
            for (var i = 0; i < tarkistettavat.length; i++) {
                var ix = tarkistettavat[i].x;
                var iy = tarkistettavat[i].y;
                if (!merkit[ix][iy]) {
                    //jos tämä ei ole vielä näkyvissä, avataan.
                    if (!nakyvissa[ix][iy]) {
                        nakyvissa[ix][iy] = true;
                        ruutuja_jaljella--;
                        //jos tämä oli tyhjä, aloitetaan tyhjien avaaminen
                        if (numerot[ix][iy] === 0) avaaKaikkiYmparilta(ix, iy);
                    }
                    //oho, pelaaja merkitsi väärin ja yksi "tyhjistä" olikin miina
                    if (numerot[ix][iy] < 0) {
                        pelitilanne = mahd_pelitilanteet.osui_miinaan;
                    }
                }
            }
        }
        if (pelitilanne !== mahd_pelitilanteet.osui_miinaan && ruutuja_jaljella <= 0) {
            pelitilanne = mahd_pelitilanteet.kaikki_avattu;
        }
    }
    //painettiin oikeaa eli kakkosnäppäintä
    else if (button === 2) {
        if (!nakyvissa[x][y]) merkit[x][y] = !merkit[x][y];
    }
    piirraAlustalle();
}
//piirretään peli
function piirraAlustalle() {
    //piirretään ensin tausta
    konteksti.fillStyle="#EEEEEE";
    konteksti.fillRect(0,0,piirtoalusta.width, piirtoalusta.height);
    konteksti.strokeRect(0,0,piirtoalusta.width, piirtoalusta.height);
    //piirretään ruudut
    for (var x = 0; x < kenttakoko_x; x++){
        for (var y = 0; y < kenttakoko_y; y++) {
            //jos ei näkyvissä -> piirretään tumma laatikko
            if (nakyvissa[x][y] === false) {
                konteksti.fillStyle = "#303030";
                konteksti.fillRect(ruudunkoko * x, ruudunkoko * y, ruudunkoko, ruudunkoko);
            }
            //jos näkyvissä ja numero, piirretään numero
            if (nakyvissa[x][y] === true && numerot[x][y] > 0) {
                konteksti.font="30px Verdana";
                //Eri numeroille eri värit
                konteksti.fillStyle = varit[numerot[x][y]];
                konteksti.fillText(numerot[x][y], ruudunkoko * x + ruudunkoko * 0.25, ruudunkoko * y + ruudunkoko* 0.8);
            }
            //jos ruudussa oli miina
            else if (numerot[x][y] < 0) {
                //jos tätä miinaa klikattiin, piirretään punainen tausta
                if (nakyvissa[x][y]) {
                    konteksti.fillStyle ="#FF1313";
                    konteksti.fillRect(ruudunkoko * x, ruudunkoko * y, ruudunkoko, ruudunkoko);
                }
                //jos peli on ohi, näytetään missä miinat oli
                if (pelitilanne !== mahd_pelitilanteet.peli_kesken) {
                    konteksti.drawImage(kuva_miina, ruudunkoko * x, ruudunkoko * y);
                }
            }
            //jos ruutu on merkitty, piirretään lippu
            if (merkit[x][y] === true) {
                konteksti.drawImage(kuva_lippu, ruudunkoko * x, ruudunkoko * y);
            }
        }
    }
    //piirretään viivat
    konteksti.fillStyle = "#000000";
    for (var x = 0; x < kenttakoko_x; x++) {
        konteksti.beginPath();
        konteksti.moveTo(ruudunkoko * x, 0);
        konteksti.lineTo(ruudunkoko * x, ruudunkoko * kenttakoko_y);
        konteksti.stroke();
    }
    for (var y = 0; y < kenttakoko_y; y++) {
        konteksti.beginPath();
        konteksti.moveTo(0, ruudunkoko * y);
        konteksti.lineTo(kenttakoko_x * ruudunkoko, ruudunkoko * y);
        konteksti.stroke();
    }
}
//aloitus
(function(){
    //aloitetaan
    alustaPeli();
    aloitaPeliAlusta();
    //lisätään hiirenkäsittelijä
    piirtoalusta.addEventListener("mousedown", function (e) {
        klikkaus(e);
    });
    //estetään kontekstivalikon avautuminen, jotta hiirenpainallus menisi klikkauskäsittelyyn
    piirtoalusta.oncontextmenu = function (e) {
        e.preventDefault();
    };
})();