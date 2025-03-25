const { expect } = require("chai");
const sinon = require("sinon");
const intervalController = require("../controllers/intervalController");
const Interval = require("../models/Interval");
const User = require("../models/User");
const Goal = require("../models/Goal");
const IntervalGoal = require("../models/IntervalGoal");

describe("Interval Controller", () => {
  let req,
    res,
    next,
    findByIdStub,
    createStub,
    findAllStub,
    updateStub,
    deleteStub,
    countStub,
    countGoalsStub,
    getGoalsStub;
  let userFindByIdStub,
    goalFindByIdStub,
    intervalGoalAssociateStub,
    intervalGoalDissociateStub;

  beforeEach(() => {
    // Ripristina tutti gli stub esistenti
    sinon.restore();

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
    it("dovrebbe creare un nuovo intervallo con successo", async () => {
      req.body = {
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };

      const user = {
        id: 1,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      };
      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };
      const completeInterval = { ...interval, user, goals: [] };

      userFindByIdStub = sinon.stub(User, "findById").resolves(user);
      createStub = sinon.stub(Interval, "create").resolves(interval);
      findByIdStub = sinon
        .stub(Interval, "findById")
        .resolves(completeInterval);

      await intervalController.create(req, res, next);

      expect(userFindByIdStub.calledOnce).to.be.true;
      expect(userFindByIdStub.calledWith(req.body.userId)).to.be.true;
      expect(createStub.calledOnce).to.be.true;
      expect(createStub.calledWith(req.body)).to.be.true;
      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(interval.id)).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe creare un intervallo con obiettivi associati", async () => {
      req.body = {
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
        goalIds: [1, 2],
      };

      const user = {
        id: 1,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
      };
      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };
      const completeInterval = {
        ...interval,
        user,
        goals: [
          { id: 1, name: "Goal 1" },
          { id: 2, name: "Goal 2" },
        ],
      };

      userFindByIdStub = sinon.stub(User, "findById").resolves(user);
      createStub = sinon.stub(Interval, "create").resolves(interval);
      intervalGoalAssociateStub = sinon
        .stub(IntervalGoal, "associate")
        .resolves({ id: 1, intervalId: 1, goalId: 1 });
      findByIdStub = sinon
        .stub(Interval, "findById")
        .resolves(completeInterval);

      await intervalController.create(req, res, next);

      expect(userFindByIdStub.calledOnce).to.be.true;
      expect(createStub.calledOnce).to.be.true;
      expect(intervalGoalAssociateStub.calledTwice).to.be.true;
      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 404 se l'utente non esiste", async () => {
      req.body = {
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 999,
      };

      userFindByIdStub = sinon.stub(User, "findById").resolves(null);

      await intervalController.create(req, res, next);

      expect(userFindByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      req.body = {
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };

      const error = new Error("Database error");
      userFindByIdStub = sinon.stub(User, "findById").throws(error);

      await intervalController.create(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getAll", () => {
    it("dovrebbe ottenere tutti gli intervalli con paginazione", async () => {
      req.query = { page: 1, limit: 10 };

      const intervals = [
        {
          id: 1,
          startDate: "2023-09-01",
          endDate: "2023-09-30",
          userId: 1,
        },
        {
          id: 2,
          startDate: "2023-10-01",
          endDate: "2023-10-31",
          userId: 1,
        },
      ];

      const total = 15;
      countStub = sinon.stub(Interval, "count").resolves(total);
      findAllStub = sinon.stub(Interval, "findAll").resolves(intervals);

      await intervalController.getAll(req, res, next);

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
        results: intervals.length,
        data: intervals,
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

    it("dovrebbe applicare i filtri se specificati", async () => {
      req.query = {
        page: 1,
        limit: 10,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        goalId: "1",
      };

      const intervals = [
        {
          id: 1,
          startDate: "2023-09-01",
          endDate: "2023-09-30",
          userId: 1,
        },
      ];

      countStub = sinon.stub(Interval, "count").resolves(1);
      findAllStub = sinon.stub(Interval, "findAll").resolves(intervals);

      await intervalController.getAll(req, res, next);

      expect(countStub.calledOnce).to.be.true;
      expect(findAllStub.calledOnce).to.be.true;

      // Verifichiamo che countStub sia stato chiamato con un oggetto
      expect(countStub.firstCall.args[0]).to.be.an("object");

      // Verifichiamo che findAllStub sia stato chiamato con i parametri di base
      expect(findAllStub.firstCall.args[0]).to.deep.include({
        skip: 0,
        limit: 10,
      });
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      const error = new Error("Database error");
      countStub = sinon.stub(Interval, "count").throws(error);

      await intervalController.getAll(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getOne", () => {
    it("dovrebbe ottenere un intervallo specifico con successo", async () => {
      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };

      req.params.id = 1;
      findByIdStub = sinon.stub(Interval, "findById").resolves(interval);

      await intervalController.getOne(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        data: interval,
      });
    });

    it("dovrebbe restituire un errore 404 se l'intervallo non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(Interval, "findById").resolves(null);

      await intervalController.getOne(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });

  describe("getIntervalGoals", () => {
    it("dovrebbe ottenere tutti gli obiettivi di un intervallo con paginazione", async () => {
      req.params.id = 1;
      req.query = { page: 1, limit: 10 };

      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };

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

      const total = 5;

      findByIdStub = sinon.stub(Interval, "findById").resolves(interval);
      countGoalsStub = sinon.stub(Interval, "countGoals").resolves(total);
      getGoalsStub = sinon.stub(Interval, "getGoals").resolves(goals);

      await intervalController.getIntervalGoals(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(countGoalsStub.calledOnce).to.be.true;
      expect(countGoalsStub.calledWith(req.params.id)).to.be.true;
      expect(getGoalsStub.calledOnce).to.be.true;
      expect(getGoalsStub.firstCall.args[0]).to.equal(req.params.id);
      expect(getGoalsStub.firstCall.args[1]).to.deep.include({
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
        total: 5,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("dovrebbe restituire un errore 404 se l'intervallo non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(Interval, "findById").resolves(null);

      await intervalController.getIntervalGoals(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      req.params.id = 1;
      const error = new Error("Database error");
      findByIdStub = sinon.stub(Interval, "findById").throws(error);

      await intervalController.getIntervalGoals(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("associateGoal", () => {
    it("dovrebbe associare un obiettivo a un intervallo con successo", async () => {
      req.params.id = 1;
      req.body.goalId = 2;

      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };
      const goal = { id: 2, name: "Test Goal" };
      const association = { id: 1, intervalId: 1, goalId: 2 };

      findByIdStub = sinon.stub(Interval, "findById").resolves(interval);
      goalFindByIdStub = sinon.stub(Goal, "findById").resolves(goal);
      intervalGoalAssociateStub = sinon
        .stub(IntervalGoal, "associate")
        .resolves(association);

      await intervalController.associateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(goalFindByIdStub.calledOnce).to.be.true;
      expect(intervalGoalAssociateStub.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 404 se l'intervallo non esiste", async () => {
      req.params.id = 999;
      req.body.goalId = 2;

      findByIdStub = sinon.stub(Interval, "findById").resolves(null);

      await intervalController.associateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 404 se l'obiettivo non esiste", async () => {
      req.params.id = 1;
      req.body.goalId = 999;

      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };

      findByIdStub = sinon.stub(Interval, "findById").resolves(interval);
      goalFindByIdStub = sinon.stub(Goal, "findById").resolves(null);

      await intervalController.associateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(goalFindByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });

  describe("dissociateGoal", () => {
    it("dovrebbe dissociare un obiettivo da un intervallo con successo", async () => {
      req.params.id = 1;
      req.params.goalId = 2;

      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };
      const goal = { id: 2, name: "Test Goal" };

      findByIdStub = sinon.stub(Interval, "findById").resolves(interval);
      goalFindByIdStub = sinon.stub(Goal, "findById").resolves(goal);
      intervalGoalDissociateStub = sinon
        .stub(IntervalGoal, "dissociate")
        .resolves(true);

      await intervalController.dissociateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(goalFindByIdStub.calledOnce).to.be.true;
      expect(intervalGoalDissociateStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 404 se l'intervallo non esiste", async () => {
      req.params.id = 999;
      req.params.goalId = 2;

      findByIdStub = sinon.stub(Interval, "findById").resolves(null);

      await intervalController.dissociateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 404 se l'obiettivo non esiste", async () => {
      req.params.id = 1;
      req.params.goalId = 999;

      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };

      findByIdStub = sinon.stub(Interval, "findById").resolves(interval);
      goalFindByIdStub = sinon.stub(Goal, "findById").resolves(null);

      await intervalController.dissociateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(goalFindByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 404 se l'associazione non esiste", async () => {
      req.params.id = 1;
      req.params.goalId = 2;

      const interval = {
        id: 1,
        startDate: "2023-09-01",
        endDate: "2023-09-30",
        userId: 1,
      };
      const goal = { id: 2, name: "Test Goal" };

      findByIdStub = sinon.stub(Interval, "findById").resolves(interval);
      goalFindByIdStub = sinon.stub(Goal, "findById").resolves(goal);
      intervalGoalDissociateStub = sinon
        .stub(IntervalGoal, "dissociate")
        .resolves(false);

      await intervalController.dissociateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(goalFindByIdStub.calledOnce).to.be.true;
      expect(intervalGoalDissociateStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });
});
