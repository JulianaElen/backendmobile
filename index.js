const express = require("express");
const { Client } = require('pg');
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();

app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;

var client = new Client(conString);

client.connect((err) => {
    if (err) {
        return console.error('Não foi possível conectar ao banco.', err);
    }
    client.query('SELECT NOW()', function (err, result) {
        if (err) {
            return console.error('Erro ao executar a query.', err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("Response ok.");
    res.send("Ok – Servidor disponível.");
});

app.get("/usuarios", (req, res) => {
    try {
        client.query("SELECT * FROM Usuarios", function
            (err, result) {
            if (err) {
                return console.error("Erro ao executar a qry de SELECT", err);
            }
            res.send(result.rows);
            console.log("Rota: get usuarios");
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/usuarios/:id", (req, res) => {
    try {
        console.log("Rota: usuarios/" + req.params.id);
        client.query(
            "SELECT * FROM Usuarios WHERE id = $1", [req.params.id],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                res.send(result.rows);
                //console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/usuarios/:id", (req, res) => {
    try {
        console.log("Rota: delete/" + req.params.id);
        client.query(
            "DELETE FROM Usuarios WHERE id = $1", [req.params.id], (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(404).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/usuarios", (req, res) => {
    try {
        console.log("Alguém enviou um post com os dados:", req.body);
        const { nome, email, altura, peso } = req.body;
        client.query(
            "INSERT INTO Usuarios (nome, email, altura, peso) VALUES ($1, $2, $3, $4) RETURNING * ", [nome, email, altura, peso],
            (err, result) => {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/usuarios/:id", (req, res) => {
    try {
        console.log("Alguém enviou um update com os dados:", req.body);
        const id = req.params.id;
        const { nome, email, altura, peso } = req.body;
        client.query(
            "UPDATE Usuarios SET nome=$1, email=$2, altura=$3, peso=$4 WHERE id =$5 ",
            [nome, email, altura, peso, id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ "identificador": id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.post("/questionario", (req, resp) => {
    try {
        console.log("Alguém enviou um update com os dados:", req.body);
        const id = req.params.id;
        const { q1, q2, q3, q4, q5, q6, q7, q8, q9, q10 } = req.body;
        client.query(
            "INSERT INTO questionario (q1, q2, q3, q4, q5, q6, q7, q8, q9, q10) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
            [q1, q2, q3, q4, q5, q6, q7, q8, q9, q10],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                } 
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

// Rotas para pedidosdm
app.get("/pedidosdm", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM pedidosdm");
        res.send(result.rows);
    } catch (err) {
        console.error("Erro ao executar a qry de SELECT", err);
        res.status(500).send("Erro ao executar a qry de SELECT");
    }
});
app.delete("/pedidosdm/:id", async (req, res) => {
    try {
        const pedidoId = req.params.id;
        const result = await client.query(
            "DELETE FROM pedidosdm WHERE id = $1", [pedidoId]
        );

        if (result.rowCount === 0) {
            res.status(404).json({ info: "Pedido não encontrado." });
        } else {
            res.status(200).json({ info: `Pedido excluído com sucesso. ID: ${pedidoId}` });
        }
    } catch (err) {
        console.error("Erro ao executar a query de DELETE", err);
        res.status(500).send("Erro ao excluir o pedido.");
    }
});

app.get("/pedidosdm/:id", async (req, res) => {
    try {
        const result = await client.query(
            "SELECT * FROM pedidosdm WHERE id = $1", [req.params.id]
        );
        res.send(result.rows);
    } catch (err) {
        console.error("Erro ao executar a qry de SELECT id", err);
        res.status(500).send("Erro ao executar a qry de SELECT id");
    }
});

app.post("/pedidosdm", async (req, res) => {
    try {
        const { data_pedido, hora_pedido, recheio, cobertura, decoracao, formato, tamanho, total } = req.body;

        const result = await client.query(
            "INSERT INTO pedidosdm (data_pedido, hora_pedido, recheio, cobertura, decoracao, formato, tamanho, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", 
            [data_pedido, hora_pedido, recheio, cobertura, decoracao, formato, tamanho, total]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error("Erro ao executar a query de INSERT", err);
        if (err.code === '23505') { // Código de erro para violação de chave única
            res.status(409).send("Pedido já existente.");
        } else {
            res.status(500).send("Erro ao executar a query de INSERT");
        }
    }
});



// Rota para verificar login de usuário
app.post("/usuarios/login", (req, res) => {
    try {
        const { username, senha } = req.body;
        
        // Consulta SQL para verificar se o usuário e senha correspondem
        const query = {
            text: 'SELECT * FROM Usuarios WHERE username = $1 AND senha = $2',
            values: [username, senha],
        };

        client.query(query, (err, result) => {
            if (err) {
                console.error("Erro ao executar a consulta de login", err);
                res.status(500).send("Erro ao verificar login");
            } else {
                if (result.rows.length > 0) {
                    res.status(200).json({ message: "Login bem sucedido", user: result.rows[0] });
                } else {
                    res.status(401).json({ message: "Credenciais inválidas" });
                }
            }
        });
    } catch (error) {
        console.error("Erro ao processar a requisição de login", error);
        res.status(500).send("Erro ao processar a requisição de login");
    }
});


app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports = app;