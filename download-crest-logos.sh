#!/bin/bash
set -e

get() {
  name="$1"
  id="$2"
  echo "Downloading $name"
  curl -L --fail "https://crests.football-data.org/$id.png" -o "public/logos/$name.png"
}

get arsenal 57
get aston-villa 58
get chelsea 61
get everton 62
get fulham 63
get liverpool 64
get manchester-city 65
get manchester-united 66
get newcastle 67
get tottenham 73
get wolves 76
get brighton 397
get brentford 402
get west-ham 563
get bournemouth 1044
get burnley 328
get leeds 341

get bayern 5
get dortmund 4
get leverkusen 3
get leipzig 721

get barcelona 81
get real-madrid 86
get atletico 78

get juventus 109
get inter 108
get milan 98
get roma 100
get napoli 113
get psg 524

echo "Downloaded:"
ls -lh public/logos
