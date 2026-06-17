module.exports = nodecg => {
    const secrets = nodecg.bundleConfig.secrets

    const matchesRep = nodecg.Replicant("matchDataRep", {
        defaultValue: {
            matches: [
                {
                    gameTitle: "",
                    gameTime: 0,
                    finalized: false,
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

    const singleMatchDataRep = nodecg.Replicant("singleMatchDataRep", {
        defaultValue: {
            gameTitle: "",
            gameTime: 0,
            finalized: false,
            players: [
                {
                    flag: "",
                    name: "",
                    diff: 0,
                    score: 0
                }
            ]
        },
        persistent: true
    })

    nodecg.listenFor('getMatch', async matchId => {

        let jwt;

        const getJwtBody = JSON.stringify({
            "email": secrets.supabase_email,
            "password": secrets.supabase_password
        })

        fetch(`https://rirhcdkwgrjwyktqffby.supabase.co/auth/v1/token?grant_type=password`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "apikey": secrets.supabase_apikey,
            },
            body: getJwtBody
        })
        .then(response => response.json())
        .then(data => {
            jwt=data.access_token
            console.log(jwt)

            fetch(`https://sbgleague.base44.app/api/entities/MatchEntry?q={"match_id":"${matchId}"}&sort_by=finish_position`, {
                headers: {
                    'Accept': 'application/json',
                    // 'Authorization': `Bearer ${jwt}`,
                    'api_key': secrets.sbgl_legacy_apikey
                }
            })
            .then(response => response.json())
            .then(data => {
                for (entry of data) {
                    console.log(entry)
                    fetch(`https://sbgleague.base44.app/api/entities/Player/${entry.player_id}`, {
                        headers: {
                            'Accept': 'application/json',
                            // 'Authorization': `Bearer ${jwt}`,
                            'api_key': secrets.sbgl_legacy_apikey
                        }
                    })
                    .then(response => response.json())
                    .then(data => {console.log(data)})
                }
            })
        })

    })
}

