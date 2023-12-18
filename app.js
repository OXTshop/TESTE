const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');

const app = express();
const port = 80;

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('produto.db');

// Middleware para analisar dados de formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos da pasta 'public'
app.use(express.static('public'));

// Rota para exibir a lista de produtos com dados dinâmicos
app.get('/', (req, res) => {
  const clientIP = req.connection.remoteAddress;
  console.log(`Alguém acessou a página a partir do IP: ${clientIP}`);
  
  db.all('SELECT Produto, Quantidade, SKU, EAN, IMG, VALOR FROM Produtos_levantamento', (err, rows) => {
    if (err) {
      return console.error(err.message);
    }

    const dataHtml = rows.map(row => `
      <tr>
        <td>${row.Produto}</td>
        <td>${row.Quantidade}</td>
        <td>${row.SKU}</td>
        <td>${row.EAN}</td>
        <td>${row.VALOR}</td>
        <td>${row.IMG}</td>
      </tr>`).join('');
      
    // Consulta o banco de dados para obter a lista de produtos
    db.all('SELECT Produto, Quantidade, SKU, EAN, IMG, VALOR FROM Produtos_levantamento', (err, produtos) => {
      if (err) {
        return console.error(err.message);
      }

      const produtosOptions = produtos.map(row => `
        
        <option value="${row.Produto}">${row.Produto},    ${row.Quantidade} Und</option>`).join('');

      const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Controle de Estoque</title>

      </head>
      <body>
        <style>
        /* Estilizando a tabela */
        table {
            width: 100%; /* Torna a tabela responsiva */
            border-collapse: collapse;
            border: 1px solid #ccc;
            margin: 20px 0;
        }
        
        /* Estilos para as células do cabeçalho da tabela */
        table th {
            background-color: #f2f2f2;
            border: 1px solid #ccc;
            padding: 4px;
            text-align: left;
        }
        
        /* Estilos para as células de dados da tabela */
        table td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
        }
        
        /* Estilizando as linhas pares da tabela */
        table tr:nth-child(even) {
            background-color: #f5f5f5;
        }
        
        /* Estilizando as linhas ímpares da tabela */
        table tr:nth-child(odd) {
            background-color: #ffffff;
        }
        
        /* Estilizando o título da página */
        h1 {
            font-family: Arial, sans-serif;
            font-size: 2em; /* Usa unidades em para redimensionamento */
            color: #333;
            text-align: center;
            margin-top: 20px;
        }
        
        /* Estilizando o formulário */
        form {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        }
        
        /* Estilizando os labels do formulário */
        form label {
            font-size: 1.2em; /* Usa unidades em para redimensionamento */
        }
        
        /* Aumenta o tamanho da fonte para os botões */
        button {
            font-size: 1.2em; /* Usa unidades em para redimensionamento */
            margin: 10px;
        }
        
        /* Estilizando os inputs e selects do formulário */
        #produto, #quantidade, #acao {
            height: 30px;
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ccc;
            font-size: 1em; /* Usa unidades em para redimensionamento */
            padding: 5px;
            width: 100%; /* Torna os inputs e selects responsivos */
        }
        
        </style>
          <h1>Lista de Produtos</h1>
          <table>
              <thead>
                  <tr>
                      <th>Produto</th>
                      <th>Quantidade</th>
                      <th>SKU</th>
                      <th>EAN</th>
                      <th>VALOR</th>
                      <th>IMG</th>
                  </tr>
              </thead>
                <form method="post" action="/atualizar">

                  <label for="produto" style="font-size: 20px;">Produto:</label>
                  <select name="produto" id="produto" required>
                    ${produtosOptions}
                  </select>
                  <label for="quantidade" style="font-size: 20px;">Quantidade:</label>
                  <input type="number" name="quantidade" id="quantidade" required>
                  <label for="acao">Ação:</label>
                  <select name="acao" id="acao">
                    <option value="adicionar">Adicionar</option>
                    <option value="remover">Remover</option>
                  </select>
                  <button type="submit">Atualizar</button>
                </form>
              <tbody>
                  ${dataHtml}
              </tbody>
          </table>
      </body>
      </html>`;

      res.send(html);
    });
  });
});

// Rota para processar a atualização da quantidade
app.post('/atualizar', (req, res) => {
  const { produto, quantidade, acao, IMG } = req.body;
  
  let sql;
  if (acao === 'adicionar') {
    sql = 'UPDATE Produtos_levantamento SET Quantidade = Quantidade + ? WHERE Produto = ?';
  } else {
    sql = 'UPDATE Produtos_levantamento SET Quantidade = Quantidade - ? WHERE Produto = ?';
    
  }

  db.run(sql, [quantidade, produto], function(err) {
    if (err) {
      return console.error(err.message);
    }
    
    console.log(`${acao.charAt(0).toUpperCase() + acao.slice(1)} quantidade de ${quantidade} para ${produto}`);
    res.redirect('/');
  });
});

// Inicie o servidor na porta especificada
app.listen(port, '192.168.0.104',() => {
    console.log(`Servidor está rodando em http://192.168.0.104:${port}`);
  });
