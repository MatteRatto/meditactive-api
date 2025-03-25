const { expect } = require("chai");
const sinon = require("sinon");
const goalController = require("../controllers/goalController");
const Goal = require("../models/Goal");

describe("Goal Controller", () => {
  let req,
    res,
    next,
    findByIdStub,
    createStub,
    findAllStub,
    updateStub,
    deleteStub,
    countStub;

  beforeEach(() => {
    if (findByIdStub) findByIdStub.restore();
    if (createStub) createStub.restore();
    if (findAllStub) findAllStub.restore();
    if (updateStub) updateStub.restore();
    if (deleteStub) deleteStub.restore();
    if (countStub) countStub.restore();

    req = {
      body: {},
      params: {},
      query: {},
    };

    res = {
      status: sinon.stub().returns({
        json: sinon.spy(),
      }),
    };

    next = sinon.spy();
  });

  describe("create", () => {
    it("dovrebbe creare un nuovo obiettivo con successo", async () => {
      req.body = {
        name: "Meditazione quotidiana",
        description: "Pratica 15 minuti di meditazione ogni giorno",
      };

      const goal = {
        id: 1,
        name: "Meditazione quotidiana",
        description: "Pratica 15 minuti di meditazione ogni giorno",
      };

      createStub = sinon.stub(Goal, "create").resolves(goal);

      await goalController.create(req, res, next);

      expect(createStub.calledOnce).to.be.true;
      expect(createStub.calledWith(req.body)).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        message: "Obiettivo creato con successo",
        data: goal,
      });
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      req.body = {
        name: "Meditazione quotidiana",
        description: "Pratica 15 minuti di meditazione ogni giorno",
      };

      const error = new Error("Database error");
      createStub = sinon.stub(Goal, "create").throws(error);

      await goalController.create(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getAll", () => {
    it("dovrebbe ottenere tutti gli obiettivi con paginazione", async () => {
      req.query = { page: 1, limit: 10 };

      const goals = [
        {
          id: 1,
          name: "Meditazione quotidiana",
          description: "Pratica 15 minuti di meditazione ogni giorno",
        },
        {
          id: 2,
          name: "Attività fisica",
          description:
            "Almeno 30 minuti di esercizio fisico 3 volte a settimana",
        },
      ];

      // Totale: 15 obiettivi, 2 pagine
      const total = 15;
      countStub = sinon.stub(Goal, "count").resolves(total);
      findAllStub = sinon.stub(Goal, "findAll").resolves(goals);

      await goalController.getAll(req, res, next);

      expect(countStub.calledOnce).to.be.true;
      expect(findAllStub.calledOnce).to.be.true;
      expect(findAllStub.firstCall.args[0]).to.deep.include({
        skip: 0,
        limit: 10,
      });
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;

      const response = res.status().json.args[0][0];
      expect(response).to.deep.include({
        status: "success",
        results: goals.length,
        data: goals,
      });
      expect(response).to.have.property("pagination");
      expect(response.pagination).to.deep.include({
        total: 15,
        totalPages: 2,
        currentPage: 1,
        pageSize: 10,
        hasNext: true,
        hasPrev: false,
      });
    });

    it("dovrebbe usare i valori predefiniti per page e limit se non specificati", async () => {
      req.query = {};

      const goals = [
        { id: 1, name: "Meditazione quotidiana" },
        { id: 2, name: "Attività fisica" },
      ];

      countStub = sinon.stub(Goal, "count").resolves(5);
      findAllStub = sinon.stub(Goal, "findAll").resolves(goals);

      await goalController.getAll(req, res, next);

      expect(findAllStub.firstCall.args[0]).to.deep.include({
        skip: 0,
        limit: 10,
      });
    });

    it("dovrebbe applicare correttamente i filtri", async () => {
      req.query = {
        page: 1,
        limit: 10,
        name: "Meditazione",
      };

      const goals = [{ id: 1, name: "Meditazione quotidiana" }];

      countStub = sinon.stub(Goal, "count").resolves(1);
      findAllStub = sinon.stub(Goal, "findAll").resolves(goals);

      await goalController.getAll(req, res, next);

      expect(countStub.firstCall.args[0]).to.deep.include({
        name: "Meditazione",
      });
      expect(findAllStub.firstCall.args[0]).to.deep.include({
        skip: 0,
        limit: 10,
        name: "Meditazione",
      });
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      const error = new Error("Database error");
      countStub = sinon.stub(Goal, "count").throws(error);

      await goalController.getAll(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getOne", () => {
    it("dovrebbe ottenere un obiettivo specifico con successo", async () => {
      const goal = {
        id: 1,
        name: "Meditazione quotidiana",
        description: "Pratica 15 minuti di meditazione ogni giorno",
      };

      req.params.id = 1;
      findByIdStub = sinon.stub(Goal, "findById").resolves(goal);

      await goalController.getOne(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        data: goal,
      });
    });

    it("dovrebbe restituire un errore 404 se l'obiettivo non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(Goal, "findById").resolves(null);

      await goalController.getOne(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });

  describe("update", () => {
    it("dovrebbe aggiornare un obiettivo con successo", async () => {
      req.params.id = 1;
      req.body = {
        name: "Meditazione aggiornata",
        description: "Nuova descrizione",
      };

      const existingGoal = {
        id: 1,
        name: "Meditazione quotidiana",
        description: "Pratica 15 minuti di meditazione ogni giorno",
      };

      const updatedGoal = {
        id: 1,
        name: "Meditazione aggiornata",
        description: "Nuova descrizione",
      };

      findByIdStub = sinon.stub(Goal, "findById").resolves(existingGoal);
      updateStub = sinon.stub(Goal, "update").resolves(updatedGoal);

      await goalController.update(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(updateStub.calledOnce).to.be.true;
      expect(updateStub.calledWith(req.params.id, req.body)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        message: "Obiettivo aggiornato con successo",
        data: updatedGoal,
      });
    });

    it("dovrebbe restituire un errore 404 se l'obiettivo non esiste", async () => {
      req.params.id = 999;
      req.body = {
        name: "Meditazione aggiornata",
      };

      findByIdStub = sinon.stub(Goal, "findById").resolves(null);

      await goalController.update(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });

  describe("delete", () => {
    it("dovrebbe eliminare un obiettivo con successo", async () => {
      req.params.id = 1;

      const existingGoal = {
        id: 1,
        name: "Meditazione quotidiana",
      };

      findByIdStub = sinon.stub(Goal, "findById").resolves(existingGoal);
      deleteStub = sinon.stub(Goal, "delete").resolves(true);

      await goalController.delete(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(deleteStub.calledOnce).to.be.true;
      expect(deleteStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        message: "Obiettivo eliminato con successo",
      });
    });

    it("dovrebbe restituire un errore 404 se l'obiettivo non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(Goal, "findById").resolves(null);

      await goalController.delete(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });
});
