const { expect } = require("chai");
const sinon = require("sinon");
const intervalController = require("../controllers/intervalController");
const Interval = require("../models/Interval");
const User = require("../models/User");
const IntervalGoal = require("../models/IntervalGoal");

describe("Interval Controller", () => {
  let req,
    res,
    next,
    findByIdStub,
    createStub,
    findAllStub,
    updateStub,
    deleteStub;
  let userFindByIdStub, intervalGoalAssociateStub;

  beforeEach(() => {
    if (findByIdStub) findByIdStub.restore();
    if (createStub) createStub.restore();
    if (findAllStub) findAllStub.restore();
    if (updateStub) updateStub.restore();
    if (deleteStub) deleteStub.restore();
    if (userFindByIdStub) userFindByIdStub.restore();
    if (intervalGoalAssociateStub) intervalGoalAssociateStub.restore();

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
    it("dovrebbe ottenere tutti gli intervalli con successo", async () => {
      const intervals = [
        {
          id: 1,
          startDate: "2023-09-01",
          endDate: "2023-09-30",
          userId: 1,
          user: {},
          goals: [],
        },
        {
          id: 2,
          startDate: "2023-10-01",
          endDate: "2023-10-31",
          userId: 1,
          user: {},
          goals: [],
        },
      ];

      findAllStub = sinon.stub(Interval, "findAll").resolves(intervals);

      await intervalController.getAll(req, res, next);

      expect(findAllStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        results: intervals.length,
        data: intervals,
      });
    });

    it("dovrebbe applicare i filtri se specificati", async () => {
      req.query = {
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
          user: {},
          goals: [{ id: 1 }],
        },
      ];

      findAllStub = sinon.stub(Interval, "findAll").resolves(intervals);

      await intervalController.getAll(req, res, next);

      expect(findAllStub.calledOnce).to.be.true;
      expect(
        findAllStub.calledWith({
          startDate: "2023-09-01",
          endDate: "2023-09-30",
          goalId: "1",
        })
      ).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      const error = new Error("Database error");
      findAllStub = sinon.stub(Interval, "findAll").throws(error);

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
        user: {
          id: 1,
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
        },
        goals: [],
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
      const goalFindByIdStub = sinon
        .stub(require("../models/Goal"), "findById")
        .resolves(goal);
      intervalGoalAssociateStub = sinon
        .stub(IntervalGoal, "associate")
        .resolves(association);

      await intervalController.associateGoal(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(goalFindByIdStub.calledOnce).to.be.true;
      expect(intervalGoalAssociateStub.calledOnce).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;

      // Ripristina stub
      goalFindByIdStub.restore();
    });
  });
});
