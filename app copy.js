const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 80;

const db = new sqlite3.Database('produto.db');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    const clientIP = req.connection.remoteAddress;
    console.log(`Alguém acessou a página a partir do IP: ${clientIP}`);
    
    db.all('SELECT Produto, Quantidade, SKU, EAN, IMG, VALOR FROM Produtos_levantamento', (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        res.render('index', { produtos: rows });
    });
});

app.post('/atualizar', (req, res) => {
    const produto = req.body.produto;
    const campo = req.body.campo;
    const valor = req.body.valor;
    const acao = req.body.acao;

    // Lógica para atualizar o banco de dados
    let sql;

    if (acao === 'adicionar') {
        sql = `UPDATE Produtos_levantamento SET ${campo} = ${campo} + ? WHERE Produto = ?`;
    } else if (acao === 'subtrair') {
        sql = `UPDATE Produtos_levantamento SET ${campo} = ${campo} - ? WHERE Produto = ?`;
    } else if (acao === 'nulo') {
        sql = `UPDATE Produtos_levantamento SET ${campo} = NULL WHERE Produto = ?`;
    } else {
        res.status(400).send('Ação inválida');
        return;
    }

    db.run(sql, [valor, produto], function (err) {
        if (err) {
        console.error(err.message);
        res.status(500).send('Erro ao atualizar o banco de dados');
        return;
        }

        console.log(`${acao.charAt(0).toUpperCase() + acao.slice(1)} ${campo} de ${valor} para ${produto}`);
        res.redirect('/');
    });
    });




app.listen(port, '192.168.0.104', () => {
    console.log(`Servidor está rodando em http://192.168.0.104:${port}`);
});
