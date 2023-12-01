const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");

const JWTSecret = "fndkfnkdsnkfndsfndskfkldsfkldsfknfksfnsknndskfn"

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function auth(req, res, next) {
    const authToken = req.headers['authorization'];

    if (authToken != undefined) {
        const bearer = authToken.split(' ');
        var token = bearer[1];

        jwt.verify(token, JWTSecret, (err, data) => {
            if (err) {
                res.status(401).json({ err: "Token inválido!" });
            } else {
                req.token = token;
                req.loggedUser = { id: data.id, email: data.email };
                next(); // Mova o next() para dentro do bloco else
            }
        });
    } else {
        res.status(401).json({ err: "Token não fornecido!" });
    }
}

var DB = {
    games: [
        {
            id: 1,
            title: "Call of duty MW",
            year: 2019,
            price: 60
        },
        {
            id: 2,
            title: "Sea of thieves",
            year: 2018,
            price: 40
        },
        {
            id: 3,
            title: "Minecraft",
            year: 2012,
            price: 20
        }
    ],

    users:[
        {
            id: 1,
            name:"Joaquim Mulaza",
            email: "joaquimmulazadev@gmail.com",
            password: "bbbb"
        },

        {
            id: 4,
            name:"Delcio Figueiro",
            email: "delciofigueiredo@gmail.com",
            password: "1234"
        }
    ]
}

app.get("/games", auth, (req, res) => {
    res.statusCode = 200;
    res.json(DB.games);
});

app.get("/game/:id", auth, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){
            res.statusCode = 200;
            res.json(game);
        }else{
            res.sendStatus(404);
        }
    }
});

app.post("/game", auth, (req, res) => {
    var { title, price, year } = req.body;

    // Encontrar o último ID
    var lastId = DB.games.length > 0 ? DB.games[DB.games.length - 1].id : 0;

    // Gerar um novo ID incrementando o último ID
    var newId = lastId + 1;

    // Adicionar o novo jogo ao banco de dados
    DB.games.push({
        id: newId,
        title,
        price,
        year
    });

    res.status(200).send("CRIADO COM SUCESSO");
});

app.delete("/game/:id", auth, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index,1);
            res.status(200).send("APAGADO COM SUCESSO");
        }
    }
});

app.put("/game/:id", auth, (req, res) => {

    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        
        var id = parseInt(req.params.id);

        var game = DB.games.find(g => g.id == id);

        if(game != undefined){

            var {title, price, year} = req.body;

            
            if(title != undefined){
                game.title = title;
            }

            if(price != undefined){
                game.price = price;
            }

            if(year != undefined){
                game.year = year;
            }
            
            res.status(200).send("ATUALIZADO COM SUCESSO");

        }else{
            res.sendStatus(404);
        }
    }

});

app.post("/auth", (req, res) => {
    var {email, password} = req.body

    if(email != undefined) {
        var user = DB.users.find(u => u.email == email);

        if(user != undefined) {
            if(user.password == password) {

                jwt.sign({id: user.id, email: user.email}, JWTSecret,{expiresIn:'48h'}, (err, token) => {
                    if(err) {
                        res.status(500).json({err: "Falha interna"})
                    } else {
                        res.status(200).json({token: token});
                    }
                })
            } else {
                res.status(401);
                res.json({err: "Credenciais invalidas"})
            }
        } else {
            res.status(404);
            res.json({err: "E-mail enviado nao existe na base de dados"})
        }
    } else {
        res.status(400);
        res.json({err: "E-mail enviado invalido"})
    }
})

app.listen(45678,() => {
    console.log("API RODANDO!");
});