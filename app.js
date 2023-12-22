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
      <td><a href="/detalhes/${row.Produto}">Detalhes</a></td>
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
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
    
        header {
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 0.5em;
            margin: 0; /* Adicionado para remover a margem padrão */
        }
    
        nav {
            background-color: #555;
            color: #fff;
            text-align: center;
            padding: 0.5em;
        }
    
        nav a {
            text-decoration: none;
            color: #fff;
            margin: 0 15px;
            font-weight: bold;
            text-transform: uppercase;
        }
    
        h1 {
            font-family: Arial, sans-serif;
            font-size: 2em;
            color: #333;
            text-align: center;
            margin-top: 20px;
        }
    
        table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #ccc;
            margin: 20px 0;
        }
    
        th, td {
            border: 1px solid #ccc;
            padding: 10px;
            text-align: left;
        }
    
        th {
            background-color: #f2f2f2;
            text-transform: uppercase;
        }
    
        tr:nth-child(even) {
            background-color: #f5f5f5;
        }
    
        tr:nth-child(odd) {
            background-color: #ffffff;
        }
    
        form {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin: 20px;
        }
    
        label {
            font-size: 1.2em;
            margin-bottom: 5px;
            width: 100%;
            text-align: left;
        }
    
        select, input, button {
            height: 30px;
            background-color: #f5f5f5;
            color: #333;
            border: 1px solid #ccc;
            font-size: 1em;
            padding: 5px;
            width: calc(100% - 10px);
            box-sizing: border-box;
        }
        form {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
            margin: 20px;
          }
        
          button {
            font-size: 1.2em;
            margin-top: 10px;
            background-color: #333;
            color: #fff;
            cursor: pointer;
            border: none;
            padding: 10px;
            border-radius: 5px;
            width: 50%; /* Defina a largura desejada */
            text-align: center;
            align-self: center; /* Adicionado para centralizar verticalmente */
          }
        
        button:hover {
            background-color: #ff6600;
        }
    
        .remover {
            background-color: red;
            height: 10px;
            width: 40px;
        }
        </style>
        <header>
                <h1>Restaurante Exemplo</h1>
            </header>
            
            <nav>
                <a href="/montar-kit">Montar Kit</a>
                <a href="/adicionar-produto">adicionar</a>
                <a href="/remover-produto">Remover</a>
                <a href="/editar-todos-produtos">EDITAR</a>
            </nav>
        
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
                    <option value="remover" > REMOVER</option>
                  </select>
                  <button type="submit" id="button">Atualizar</button>
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
// Rota para exibir os detalhes de um produto específico
app.get('/detalhes/:produto', (req, res) => {
    const produtoNome = req.params.produto;
  
    db.get('SELECT Produto, Quantidade, SKU, EAN, IMG, VALOR FROM Produtos_levantamento WHERE Produto = ?', [produtoNome], (err, row) => {
      if (err) {
        return console.error(err.message);
      }
  
      // Calcula o valor total multiplicando a quantidade pelo valor unitário
      const valorTotal = row.Quantidade * row.VALOR;
  
      const detalhesHtml = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Detalhes do Produto</title>
          <style>
              body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 0;
                  background-color: #f9f9f9;
              }
                
              header {
                  background-color: #333;
                  color: white;
                  padding: 15px;
                  text-align: center;
              }

              h2 {
                  text-align: center;
                  margin-top: 20px;
              }

              p {
                  margin: 10px 0;
                  padding-left: 20px;
              }

              /* Adicione outros estilos conforme necessário */

          </style>
      </head>
      <body>
          <header>
              <h1>Detalhes do Produto</h1>
          </header>
          <h2>${row.Produto}</h2>
          <p>Quantidade: ${row.Quantidade}</p>
          <p>SKU: ${row.SKU}</p>
          <p>EAN: ${row.EAN}</p>
          <p>Valor Unitário: ${row.VALOR}</p>
          <p>Valor Total: ${valorTotal}</p>
          <p>Imagem: ${row.IMG}</p>
      </body>
      </html>
    `;

    res.send(detalhesHtml);
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

// Rota para a página de montagem de kits
// Rota para a página de montagem de kits
app.get('/montar-kit', (req, res) => {
    db.all('SELECT Produto, Quantidade, VALOR FROM Produtos_levantamento', (err, produtos) => {
      if (err) {
        return console.error(err.message);
      }
  
      const produtosOptions = produtos.map(row => `
        <option value="${row.Produto}" data-valor="${row.VALOR}">${row.Produto} - ${row.VALOR}</option>`).join('');
  
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Montar Kit</title>
            <style>
                /* Adicione os estilos CSS aqui */
                #resultado-final {
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 1.2em;
                    color: #333;
                    border-top: 2px solid #ddd;
                    padding-top: 10px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
            
                #resultado-final span {
                    color: #4caf50;
                }
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                }
            
                header {
                    background-color: #333;
                    color: white;
                    text-align: center;
                    padding: 1em;
                }
            
                #formMontarKit {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }
            
                label {
                    display: block;
                    margin-bottom: 5px;
                }
            
                select, input {
                    width: 100%;
                    padding: 8px;
                    margin-bottom: 15px;
                    box-sizing: border-box;
                }
            
                button {
                    background-color: #4caf50;
                    color: white;
                    padding: 10px;
                    border: none;
                    cursor: pointer;
                }
            
                button:hover {
                    background-color: #45a049;
                }
            
                #resultado {
                    margin-top: 20px;
                }
            
                p {
                    margin: 0;
                    padding: 8px;
                    border: 1px solid #ddd;
                    background-color: #f9f9f9;
                    position: relative;
                }
            
                .remover {
                    background-color: red;
                    color: white;
                    padding: 5px 10px;
                    position: absolute;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    cursor: pointer;
                }
            
                .remover:hover {
                    background-color: darkred;
                }
            
                #resultado-final {
                    font-weight: bold;
                    margin-bottom: 10px;
                }
            </style>
        </head>
        <body>
            <header>
                <h1>Montar Kit</h1>
            </header>
  
            <form id="formMontarKit">
                <label for="produto">Escolha um produto:</label>

                <select name="produto" id="produto" required>
                    ${produtosOptions}
                </select>
  
                <label for="quantidade">Quantidade:</label>
                <input type="number" name="quantidade" id="quantidade" required>
  
                <button type="button" onclick="adicionarProduto()">Adicionar Produto</button>
                <button type="button" onclick="calcularValorFinal()">Calcular Valor Final</button>
                <div id="resultado-final"></div>
            </form>
  
            <div id="resultado"></div>
  
            <script>
                function adicionarProduto() {
                    const selectProduto = document.getElementById('produto');
                    const inputQuantidade = document.getElementById('quantidade');
                    const resultado = document.getElementById('resultado');
            
                    const produtoSelecionado = selectProduto.value;
                    const quantidade = inputQuantidade.value;
            
                    if (produtoSelecionado && quantidade) {
                        const novoItem = document.createElement('p');
                        novoItem.innerHTML = quantidade + 'x ' + produtoSelecionado + ' <span class="remover" onclick="removerProduto(this)">REMOVER</span>';
                        novoItem.setAttribute('data-quantidade', quantidade);
                        novoItem.setAttribute('data-valor', selectProduto.options[selectProduto.selectedIndex].getAttribute('data-valor'));
                        resultado.appendChild(novoItem);
                    }
                }
            
                function calcularValorFinal() {
                    const resultado = document.getElementById('resultado');
                    const linhasProdutos = resultado.querySelectorAll('p');
                    let valorFinal = 0;
            
                    linhasProdutos.forEach((linha) => {
                        const quantidade = parseInt(linha.getAttribute('data-quantidade'), 10);
                        const valorUnitario = parseFloat(linha.getAttribute('data-valor'));
            
                        valorFinal += quantidade * valorUnitario;
                    });
            
                    const resultadoFinal = document.getElementById('resultado-final');
                    resultadoFinal.textContent = 'Valor Final: R$ ' + valorFinal.toFixed(2);
                }
            
                function removerProduto(elemento) {
                    const linha = elemento.parentElement;
                    linha.remove();
                    calcularValorFinal();
                }
            </script>
        </body>
        </html>
      `;
  
      res.send(html);
    });
  });

// Rota para exibir o formulário de adição de produtos
app.get('/adicionar-produto', (req, res) => {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
          <title>Adicionar Produto</title>
      </head>
      <body>
          <h1>Adicionar Produto</h1>
          <form method="post" action="/adicionar-produto">
              <label for="nome">Nome do Produto:</label>
              <input type="text" name="nome" id="nome" required>
  
              <label for="sku">SKU:</label>
              <input type="text" name="sku" id="sku" required>
  
              <label for="quantidade">Quantidade:</label>
              <input type="number" name="quantidade" id="quantidade" required>

              <label for="VALr">Valor:</label>
              <input type="text" name="VALr" id="VAlr" required>
  
              <button type="submit">Adicionar Produto</button>
          </form>
      </body>
      </html>
    `;
  
    res.send(html);
  });

  // Rota para processar a adição de produtos
app.post('/adicionar-produto', (req, res) => {
    const { nome, sku, quantidade, VALr } = req.body;
  
    const sql = 'INSERT INTO Produtos_levantamento (Produto, SKU, Quantidade, VALOR) VALUES (?, ?, ?, ?)';
    db.run(sql, [nome, sku, quantidade, VALr], function (err) {
      if (err) {
        return console.error(err.message);
      }
  
      console.log(`Produto adicionado: ${nome}, SKU: ${sku}, Quantidade: ${quantidade}, Valor: ${VALr}`);
      res.redirect('/');
    });
  });

// Rota para exibir o formulário de edição de produtos
app.get('/editar-produto/:produto', (req, res) => {
    const produtoNome = req.params.produto;

    db.get('SELECT Produto, Quantidade, SKU, EAN, IMG, VALOR FROM Produtos_levantamento WHERE Produto = ?', [produtoNome], (err, row) => {
        if (err) {
            return console.error(err.message);
        }

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Editar Produto</title>
            </head>
            <body>
                <h1>Editar Produto</h1>
                <form method="post" action="/editar-produto/${produtoNome}">
                    <label for="nome">Nome do Produto:</label>
                    <input type="text" name="nome" id="nome" value="${row.Produto}" required>

                    <label for="sku">SKU:</label>
                    <input type="text" name="sku" id="sku" value="${row.SKU}" required>

                    <label for="quantidade">Quantidade:</label>
                    <input type="number" name="quantidade" id="quantidade" value="${row.Quantidade}" required>

                    <label for="VALr">Valor:</label>
                    <input type="text" name="VALr" id="VALr" value="${row.VALOR}" required>

                    <button type="submit">Salvar Alterações</button>
                </form>
            </body>
            </html>
        `;

        res.send(html);
    });
});

// Rota para processar a edição de produtos
app.post('/editar-produto/:produto', (req, res) => {
    const produtoAntigo = req.params.produto;
    const { nome, sku, quantidade, VALr } = req.body;

    const sql = 'UPDATE Produtos_levantamento SET Produto = ?, SKU = ?, Quantidade = ?, VALOR = ? WHERE Produto = ?';
    db.run(sql, [nome, sku, quantidade, VALr, produtoAntigo], function (err) {
        if (err) {
            return console.error(err.message);
        }

        console.log(`Produto editado: ${produtoAntigo} -> ${nome}, SKU: ${sku}, Quantidade: ${quantidade}, Valor: ${VALr}`);
        res.redirect('/');
    });
});


  // Rota para exibir o formulário de remoção de produtos
app.get('/remover-produto', (req, res) => {
    db.all('SELECT Produto FROM Produtos_levantamento', (err, produtos) => {
      if (err) {
        return console.error(err.message);
      }
  
      const produtosOptions = produtos.map(row => `
        <option value="${row.Produto}">${row.Produto}</option>`).join('');
  
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Remover Produto</title>
        </head>
        <body>
            <h1>Remover Produto</h1>
            <form method="post" action="/remover-produto">
                <label for="produto">Escolha um produto:</label>
                <select name="produto" id="produto" required>
                    ${produtosOptions}
                </select>
  
                <button type="submit">Remover Produto</button>
            </form>
        </body>
        </html>
      `;
  
      res.send(html);
    });
  });

  app.get('/editar-todos-produtos', (req, res) => {
    db.all('SELECT Produto, Quantidade, SKU, EAN, IMG, VALOR FROM Produtos_levantamento', (err, rows) => {
        if (err) {
            return console.error(err.message);
        }

        const produtosHtml = rows.map(row => `
            <tr>
                <td>${row.Produto}</td>
                <td>${row.Quantidade}</td>
                <td><input type="text" name="sku_${row.Produto}" value="${row.SKU}"></td>
                <td>${row.EAN}</td>
                <td><input type="text" name="valor_${row.Produto}" value="${row.VALOR}"></td>
                <td>${row.IMG}</td>
            </tr>`).join('');

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Editar Todos os Produtos</title>
            </head>
            <body>
                <h1>Editar Todos os Produtos</h1>
                <form method="post" action="/atualizar-todos-produtos">
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
                        <tbody>
                            ${produtosHtml}
                        </tbody>
                    </table>
                    <button type="submit">Salvar Alterações</button>
                </form>
            </body>
            </html>
        `;

        res.send(html);
    });
});

app.post('/atualizar-todos-produtos', (req, res) => {
    const updates = [];

    // Itera sobre os parâmetros enviados no corpo da solicitação
    Object.keys(req.body).forEach(param => {
        const [field, produto] = param.split('_');

        if (field && produto) {
            // Adiciona as atualizações à lista
            updates.push({
                field,
                produto,
                value: req.body[param]
            });
        }
    });

    // Executa as atualizações no banco de dados
    updates.forEach(update => {
        const { field, produto, value } = update;

        let sql;
        if (field === 'sku') {
            sql = 'UPDATE Produtos_levantamento SET SKU = ? WHERE Produto = ?';
        } else if (field === 'valor') {
            sql = 'UPDATE Produtos_levantamento SET VALOR = ? WHERE Produto = ?';
        }

        if (sql) {
            db.run(sql, [value, produto], function (err) {
                if (err) {
                    return console.error(err.message);
                }
                console.log(`Produto ${produto} - ${field} atualizado para ${value}`);
            });
        }
    });

    res.redirect('/editar-todos-produtos');
});


// Inicie o servidor na porta especificada
app.listen(port, '192.168.0.7',() => {
    console.log(`Servidor está rodando em http://192.168.0.7:${port}`);
  });