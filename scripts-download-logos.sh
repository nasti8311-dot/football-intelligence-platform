#!/bin/bash
set -e

download() {
  file="$1"
  url="$2"
  echo "Downloading $file"
  curl -L "$url" -o "public/logos/$file"
}

download arsenal.svg "https://upload.wikimedia.org/wikipedia/en/5/53/Arsenal_FC.svg"
download liverpool.svg "https://upload.wikimedia.org/wikipedia/en/0/0c/Liverpool_FC.svg"
download manchester-city.svg "https://upload.wikimedia.org/wikipedia/en/e/eb/Manchester_City_FC_badge.svg"
download chelsea.svg "https://upload.wikimedia.org/wikipedia/en/c/cc/Chelsea_FC.svg"
download tottenham.svg "https://upload.wikimedia.org/wikipedia/en/b/b4/Tottenham_Hotspur.svg"
download newcastle.svg "https://upload.wikimedia.org/wikipedia/en/5/56/Newcastle_United_Logo.svg"
download west-ham.svg "https://upload.wikimedia.org/wikipedia/en/c/c2/West_Ham_United_FC_logo.svg"
download everton.svg "https://upload.wikimedia.org/wikipedia/en/7/7c/Everton_FC_logo.svg"
download crystal-palace.svg "https://upload.wikimedia.org/wikipedia/en/a/a2/Crystal_Palace_FC_logo_%282022%29.svg"
download brighton.svg "https://upload.wikimedia.org/wikipedia/en/f/fd/Brighton_%26_Hove_Albion_logo.svg"
download wolves.svg "https://upload.wikimedia.org/wikipedia/en/f/fc/Wolverhampton_Wanderers.svg"
download fulham.svg "https://upload.wikimedia.org/wikipedia/en/e/eb/Fulham_FC_%28shield%29.svg"
download bournemouth.svg "https://upload.wikimedia.org/wikipedia/en/e/e5/AFC_Bournemouth_%282013%29.svg"
download brentford.svg "https://upload.wikimedia.org/wikipedia/en/2/2a/Brentford_FC_crest.svg"
download leeds.svg "https://upload.wikimedia.org/wikipedia/en/5/54/Leeds_United_F.C._logo.svg"
download burnley.png "https://upload.wikimedia.org/wikipedia/en/0/02/Burnley_FC_badge.png"
download aston-villa.svg "https://upload.wikimedia.org/wikipedia/en/9/9a/Aston_Villa_FC_new_crest.svg"

download bayern.svg "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_München_logo_%282017%29.svg"
download dortmund.svg "https://upload.wikimedia.org/wikipedia/commons/6/67/Borussia_Dortmund_logo.svg"
download leverkusen.svg "https://upload.wikimedia.org/wikipedia/en/5/59/Bayer_04_Leverkusen_logo.svg"
download leipzig.svg "https://upload.wikimedia.org/wikipedia/en/0/04/RB_Leipzig_2014_logo.svg"

download real-madrid.svg "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg"
download barcelona.svg "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg"
download atletico.svg "https://upload.wikimedia.org/wikipedia/en/f/f4/Atletico_Madrid_2017_logo.svg"

download psg.svg "https://upload.wikimedia.org/wikipedia/en/a/a7/Paris_Saint-Germain_F.C..svg"
download juventus.svg "https://upload.wikimedia.org/wikipedia/commons/1/15/Juventus_FC_2017_logo.svg"
download inter.svg "https://upload.wikimedia.org/wikipedia/commons/0/05/FC_Internazionale_Milano_2021.svg"
download milan.svg "https://upload.wikimedia.org/wikipedia/commons/d/d0/Logo_of_AC_Milan.svg"
download napoli.svg "https://upload.wikimedia.org/wikipedia/commons/2/28/S.S.C._Napoli_logo.svg"
download roma.svg "https://upload.wikimedia.org/wikipedia/en/f/f7/AS_Roma_logo_%282017%29.svg"
