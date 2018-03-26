const fetch = require('node-fetch');

module.exports = function(app, db){

    app.get('/stocks', (req, res) => {
        let ticker = req.query.ticker.toUpperCase();
        let dataType = req.query.datatype || 'close';
        let startDate = req.query.startdate;
        let endDate = req.query.enddate;
        let tickerArray = ticker.split('-');
        console.log(tickerArray);

        for (let index = 0; index < tickerArray.length; index++){
            db.collection('data').findOne({"ticker": tickerArray[index]}, (err, item) => {
                if (err) {
                    res.send({'error':'An error has occurred'});
                }else {
                    if (item == null){
                        // NOT PRESENT IN DB
                        console.log("Not in DB");
                        let url = `https://www.quandl.com/api/v3/datasets/NSE/${ticker}.json?api_key=MX4zkypoSjUzp8CyotQg`
                        fetch(url)
                        .then(
                        function(response) {
                            if (response.status !== 200) {
                                console.log('Not OK');
                                if (response.status === 404){
                                    res.send("Not present in Api");
                                }
                                return;
                            }

                            response.json().then(function(data) {
                                let hist = new Array();
                                let flag = 1;

                            data.dataset.data.forEach(element => {
                                for (let i = 1; i < element.length; i++){
                                    if (flag) hist[i] = new Array();
                                    hist[i].push(element[i]);
                                }
                                flag = 0;
                            });

                            let stock = {
                                "ticker" : data.dataset.dataset_code,
                                "createdDate" : data.dataset.start_date,
                                "updatedDate" : data.dataset.end_date,
                                "priceHistory" : {
                                    "open": hist[1],
                                    "high": hist[2],
                                    "low":  hist[3],
                                    "last": hist[4],
                                    "close": hist[5],
                                    "totalTradeQuantity": hist[6],
                                    "turnovers": hist[7]
                                }
                            }
            
                            db.collection('data').insert(stock, (err, result) => {
                                if (err) { 
                                    res.send({ 'error': err }); 
                                } else {
                                    res.send(stock)     
                                }
                            });
                            });
                        }
                        )   
                        .catch(function(err) {
                            console.log('catch err',err);
                        });
                    }
                    else {
                        // PRESENT IN THE DB
                        console.log("IN the DB");
                        res.send(item)
                    }
                } 
            });
        }
    
    });

}