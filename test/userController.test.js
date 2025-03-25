const { expect } = require("chai");
const sinon = require("sinon");
const userController = require("../controllers/UserController");
const User = require("../models/User");
const Interval = require("../models/Interval");
const Goal = require("../models/Goal");

describe("User Controller", () => {
  let req,
    res,
    next,
    findByEmailStub,
    createStub,
    findAllStub,
    findByIdStub,
    updateStub,
    deleteStub,
    countStub,
    intervalCountByUserIdStub,
    intervalFindByUserIdStub,
    goalCountByUserIdStub,
    goalFindByUserIdStub;

  beforeEach(() => {
    if (findByEmailStub) findByEmailStub.restore();
    if (createStub) createStub.restore();
    if (findAllStub) findAllStub.restore();
    if (findByIdStub) findByIdStub.restore();
    if (updateStub) updateStub.restore();
    if (deleteStub) deleteStub.restore();
    if (countStub) countStub.restore();
    if (intervalCountByUserIdStub) intervalCountByUserIdStub.restore();
    if (intervalFindByUserIdStub) intervalFindByUserIdStub.restore();
    if (goalCountByUserIdStub) goalCountByUserIdStub.restore();
    if (goalFindByUserIdStub) goalFindByUserIdStub.restore();

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
    it("dovrebbe creare un nuovo utente con successo", async () => {
      req.body = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };

      findByEmailStub = sinon.stub(User, "findByEmail").resolves(null);
      createStub = sinon.stub(User, "create").resolves({
        id: 1,
        ...req.body,
      });

      await userController.create(req, res, next);

      expect(findByEmailStub.calledOnce).to.be.true;
      expect(findByEmailStub.calledWith(req.body.email)).to.be.true;
      expect(createStub.calledOnce).to.be.true;
      expect(createStub.calledWith(req.body)).to.be.true;
      expect(res.status.calledWith(201)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 409 se l'email è già registrata", async () => {
      req.body = {
        email: "existing@example.com",
        firstName: "Test",
        lastName: "User",
      };

      findByEmailStub = sinon.stub(User, "findByEmail").resolves({
        id: 1,
        email: "existing@example.com",
        firstName: "Existing",
        lastName: "User",
      });

      await userController.create(req, res, next);

      expect(findByEmailStub.calledOnce).to.be.true;
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      req.body = {
        email: "test@example.com",
        firstName: "Test",
        lastName: "User",
      };

      const error = new Error("Database error");
      findByEmailStub = sinon.stub(User, "findByEmail").throws(error);

      await userController.create(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getAll", () => {
    it("dovrebbe ottenere tutti gli utenti con paginazione", async () => {
      req.query = { page: 1, limit: 10 };

      const users = [
        {
          id: 1,
          email: "user1@example.com",
          firstName: "User1",
          lastName: "Test1",
        },
        {
          id: 2,
          email: "user2@example.com",
          firstName: "User2",
          lastName: "Test2",
        },
      ];

      const total = 25;
      countStub = sinon.stub(User, "count").resolves(total);
      findAllStub = sinon.stub(User, "findAll").resolves(users);

      await userController.getAll(req, res, next);

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
        results: users.length,
        data: users,
      });
      expect(response).to.have.property("pagination");
      expect(response.pagination).to.deep.include({
        total: 25,
        totalPages: 3,
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
        email: "test",
        firstName: "John",
        lastName: "Doe",
      };

      const users = [
        {
          id: 1,
          email: "test@example.com",
          firstName: "John",
          lastName: "Doe",
        },
      ];

      countStub = sinon.stub(User, "count").resolves(1);
      findAllStub = sinon.stub(User, "findAll").resolves(users);

      await userController.getAll(req, res, next);

      expect(countStub.calledOnce).to.be.true;
      expect(findAllStub.calledOnce).to.be.true;
      expect(countStub.firstCall.args[0]).to.deep.include({
        email: "test",
        firstName: "John",
        lastName: "Doe",
      });
      expect(findAllStub.firstCall.args[0]).to.deep.include({
        skip: 0,
        limit: 10,
        email: "test",
        firstName: "John",
        lastName: "Doe",
      });
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      const error = new Error("Database error");
      countStub = sinon.stub(User, "count").throws(error);

      await userController.getAll(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getOne", () => {
    it("dovrebbe ottenere un utente specifico con successo", async () => {
      const user = {
        id: 1,
        email: "user@example.com",
        firstName: "User",
        lastName: "Test",
      };
      req.params.id = 1;

      findByIdStub = sinon.stub(User, "findById").resolves(user);

      await userController.getOne(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        data: user,
      });
    });

    it("dovrebbe restituire un errore 404 se l'utente non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(User, "findById").resolves(null);

      await userController.getOne(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      req.params.id = 1;
      const error = new Error("Database error");
      findByIdStub = sinon.stub(User, "findById").throws(error);

      await userController.getOne(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("update", () => {
    it("dovrebbe aggiornare un utente con successo", async () => {
      req.params.id = 1;
      req.body = {
        email: "updated@example.com",
        firstName: "Updated",
        lastName: "User",
      };

      const existingUser = {
        id: 1,
        email: "user@example.com",
        firstName: "User",
        lastName: "Test",
      };

      const updatedUser = {
        id: 1,
        email: "updated@example.com",
        firstName: "Updated",
        lastName: "User",
      };

      findByIdStub = sinon.stub(User, "findById").resolves(existingUser);
      findByEmailStub = sinon.stub(User, "findByEmail").resolves(null);
      updateStub = sinon.stub(User, "update").resolves(updatedUser);

      await userController.update(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(findByEmailStub.calledOnce).to.be.true;
      expect(updateStub.calledOnce).to.be.true;
      expect(updateStub.calledWith(req.params.id, req.body)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        message: "Utente aggiornato con successo",
        data: updatedUser,
      });
    });

    it("dovrebbe restituire un errore 404 se l'utente non esiste", async () => {
      req.params.id = 999;
      req.body = {
        email: "updated@example.com",
      };

      findByIdStub = sinon.stub(User, "findById").resolves(null);

      await userController.update(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe restituire un errore 409 se l'email è già registrata", async () => {
      req.params.id = 1;
      req.body = {
        email: "existing@example.com",
      };

      const existingUser = {
        id: 1,
        email: "user@example.com",
        firstName: "User",
        lastName: "Test",
      };

      const userWithEmail = {
        id: 2,
        email: "existing@example.com",
        firstName: "Existing",
        lastName: "User",
      };

      findByIdStub = sinon.stub(User, "findById").resolves(existingUser);
      findByEmailStub = sinon.stub(User, "findByEmail").resolves(userWithEmail);

      await userController.update(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByEmailStub.calledOnce).to.be.true;
      expect(res.status.calledWith(409)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });

  describe("delete", () => {
    it("dovrebbe eliminare un utente con successo", async () => {
      req.params.id = 1;

      const existingUser = {
        id: 1,
        email: "user@example.com",
        firstName: "User",
        lastName: "Test",
      };

      findByIdStub = sinon.stub(User, "findById").resolves(existingUser);
      deleteStub = sinon.stub(User, "delete").resolves(true);

      await userController.delete(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(deleteStub.calledOnce).to.be.true;
      expect(deleteStub.calledWith(req.params.id)).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        message: "Utente eliminato con successo",
      });
    });

    it("dovrebbe restituire un errore 404 se l'utente non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(User, "findById").resolves(null);

      await userController.delete(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });
  });

  describe("getUserIntervals", () => {
    it("dovrebbe ottenere tutti gli intervalli di un utente con paginazione", async () => {
      req.params.id = 1;
      req.query = { page: 1, limit: 10 };

      const user = {
        id: 1,
        email: "user@example.com",
        firstName: "User",
        lastName: "Test",
      };

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

      const total = 5;

      findByIdStub = sinon.stub(User, "findById").resolves(user);
      intervalCountByUserIdStub = sinon
        .stub(Interval, "countByUserId")
        .resolves(total);
      intervalFindByUserIdStub = sinon
        .stub(Interval, "findByUserId")
        .resolves(intervals);

      await userController.getUserIntervals(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(intervalCountByUserIdStub.calledOnce).to.be.true;
      expect(intervalCountByUserIdStub.calledWith(req.params.id)).to.be.true;
      expect(intervalFindByUserIdStub.calledOnce).to.be.true;
      expect(intervalFindByUserIdStub.firstCall.args[0]).to.equal(
        req.params.id
      );
      expect(intervalFindByUserIdStub.firstCall.args[1]).to.deep.include({
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
        total: 5,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("dovrebbe restituire un errore 404 se l'utente non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(User, "findById").resolves(null);

      await userController.getUserIntervals(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      req.params.id = 1;
      const error = new Error("Database error");
      findByIdStub = sinon.stub(User, "findById").throws(error);

      await userController.getUserIntervals(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });

  describe("getUserGoals", () => {
    it("dovrebbe ottenere tutti gli obiettivi di un utente con paginazione", async () => {
      req.params.id = 1;
      req.query = { page: 1, limit: 10 };

      const user = {
        id: 1,
        email: "user@example.com",
        firstName: "User",
        lastName: "Test",
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

      const total = 8;

      findByIdStub = sinon.stub(User, "findById").resolves(user);
      goalCountByUserIdStub = sinon.stub(Goal, "countByUserId").resolves(total);
      goalFindByUserIdStub = sinon.stub(Goal, "findByUserId").resolves(goals);

      await userController.getUserGoals(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(findByIdStub.calledWith(req.params.id)).to.be.true;
      expect(goalCountByUserIdStub.calledOnce).to.be.true;
      expect(goalCountByUserIdStub.calledWith(req.params.id)).to.be.true;
      expect(goalFindByUserIdStub.calledOnce).to.be.true;
      expect(goalFindByUserIdStub.firstCall.args[0]).to.equal(req.params.id);
      expect(goalFindByUserIdStub.firstCall.args[1]).to.deep.include({
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
        total: 8,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
        hasNext: false,
        hasPrev: false,
      });
    });

    it("dovrebbe restituire un errore 404 se l'utente non esiste", async () => {
      req.params.id = 999;
      findByIdStub = sinon.stub(User, "findById").resolves(null);

      await userController.getUserGoals(req, res, next);

      expect(findByIdStub.calledOnce).to.be.true;
      expect(res.status.calledWith(404)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      req.params.id = 1;
      const error = new Error("Database error");
      findByIdStub = sinon.stub(User, "findById").throws(error);

      await userController.getUserGoals(req, res, next);

      expect(next.calledOnce).to.be.true;
      expect(next.calledWith(error)).to.be.true;
    });
  });
});
