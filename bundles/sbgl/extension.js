module.exports = nodecg => {
    const secrets = nodecg.bundleConfig.secrets

    const matchesRep = nodecg.Replicant("matchesRep", {
        defaultValue: {
            matches: [
                {
                    title: "",
                    time: 0,
                    finalized: false,
                    spotlight: true,
                    players: [
                        {
                            flag: "",
                            name: "",
                            diff: 0,
                            score: 0
                        }
                    ]
                },
            ],
        },
        persistent: true
    });

    const proSeriesRep = nodecg.Replicant("proSeriesRep", {
        defaultValue: [
            {
                flag: "",
                name: "",
                score: 0
            }
        ],
        persistent: true
    })

    const casterRep = nodecg.Replicant("casterRep", {
        defaultValue: {
            left: {
                name: "",
                pronouns: ""
            },
            right: {
                name: "",
                pronouns: ""
            }
        },
        persistent: true
	});

	const newsTicker = nodecg.Replicant("newsTicker", {
		defaultValue: {
			streamTitle: "",
			headline: "",
			countdownState: "",
			countdownTime: "",
			tickerLines: [
			]
		},
		persistent: true
	});

    nodecg.listenFor('pushMatches', async matches => {

        let matchesRepJson = []

        let jwt;

        const getJwtBody = JSON.stringify({
            "email": secrets.supabase_email,
            "password": secrets.supabase_password
        })

        for (match of matches) {

            let matchJson = {
                title: match.title,
                time: match.time,
                finalized: match.finalized,
                spotlight: match.spotlight,
                players: []
            }

            if (!match.id) {
                matchesRepJson.push(matchJson)
                continue
            }

            matchResponse = await fetch(`https://rirhcdkwgrjwyktqffby.supabase.co/rest/v1/match_entry?select=*&match_id=eq.${match.id}&order=finish_position.asc`, {
                headers: {
                    'Accept': 'application/json',
                    'apikey': secrets.supabase_apikey
                }
            })

            match2 = await matchResponse.json()

            console.log(match2)

            for (entry of match2) {

                let playerJson = {
                    flag: "",
                    name: "",
                    diff: entry.over_under,
                    score: entry.adjusted_match_score
                }

                playerResponse = await fetch(`https://rirhcdkwgrjwyktqffby.supabase.co/rest/v1/player?select=*&id=eq.${entry.player_id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'apikey': secrets.supabase_apikey
                    }
                })
                player = await playerResponse.json()

                console.log(player)

                playerJson.flag=player[0].region ? player[0].region : ""
                playerJson.name=player[0].ign ? player[0].ign : "Not Found"

                console.log(playerJson)

                matchJson.players.push(playerJson)

            }

            matchesRepJson.push(matchJson)

        }
        console.log(matchesRepJson)
        matchesRep.value.matches = matchesRepJson
    })

    nodecg.listenFor('getProSeries', async _ => {

    })

    nodecg.listenFor('pushCasters', async casters => {

        casterRep.value = casters

	})

	nodecg.listenFor('updateTicker', async ticker => {

		newsTicker.value = ticker

	})
}

