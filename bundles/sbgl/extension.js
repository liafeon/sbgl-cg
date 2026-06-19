const { match } = require("effect/Option");

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

    nodecg.listenFor('pushMatches', async matches => {

        let matchesRepJson = []

        let jwt;

        const getJwtBody = JSON.stringify({
            "email": secrets.supabase_email,
            "password": secrets.supabase_password
        })

        supabaseAuthResponse = await fetch(`https://rirhcdkwgrjwyktqffby.supabase.co/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": secrets.supabase_apikey,
            },
            body: getJwtBody
        })
        supabaseAuth = await supabaseAuthResponse.json()
        jwt = supabaseAuth.access_token

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

            matchResponse = await fetch(`https://sbgleague.base44.app/api/entities/MatchEntry?q={"match_id":"${match.id}"}&sort_by=finish_position`, {
                headers: {
                    'Accept': 'application/json',
                    // 'Authorization': `Bearer ${jwt}`,
                    'api_key': secrets.sbgl_legacy_apikey
                }
            })

            match2 = await matchResponse.json()

            for (entry of match2) {

                let playerJson = {
                    flag: "",
                    name: "",
                    diff: entry.over_under,
                    score: entry.adjusted_match_score
                }

                playerResponse = await fetch(`https://sbgleague.base44.app/api/entities/Player/${entry.player_id}`, {
                    headers: {
                        'Accept': 'application/json',
                        // 'Authorization': `Bearer ${jwt}`,
                        'api_key': secrets.sbgl_legacy_apikey
                    }
                })
                player = await playerResponse.json()

                playerJson.flag=player.region ? player.region : ""
                playerJson.name=player.ign ? player.ign : "Not Found"

                matchJson.players.push(playerJson)

            }

            matchesRepJson.push(matchJson)

        }

        matchesRep.value.matches = matchesRepJson
    })

    nodecg.listenFor('pushCasters', async casters => {
        console.log("hi")
        casterRep.value = casters

    })
}

