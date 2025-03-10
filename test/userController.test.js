const { expect } = require("chai");
const sinon = require("sinon");
const userController = require("../controllers/UserController");
const User = require("../models/User");

describe("User Controller", () => {
  let req,
    res,
    next,
    findByEmailStub,
    createStub,
    findAllStub,
    findByIdStub,
    updateStub,
    deleteStub;

  beforeEach(() => {
    if (findByEmailStub) findByEmailStub.restore();
    if (createStub) createStub.restore();
    if (findAllStub) findAllStub.restore();
    if (findByIdStub) findByIdStub.restore();
    if (updateStub) updateStub.restore();
    if (deleteStub) deleteStub.restore();

    req = {
      body: {},
      params: {},
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
    it("dovrebbe ottenere tutti gli utenti con successo", async () => {
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

      findAllStub = sinon.stub(User, "findAll").resolves(users);

      await userController.getAll(req, res, next);

      expect(findAllStub.calledOnce).to.be.true;
      expect(res.status.calledWith(200)).to.be.true;
      expect(res.status().json.calledOnce).to.be.true;
      expect(res.status().json.args[0][0]).to.deep.include({
        status: "success",
        results: users.length,
        data: users,
      });
    });

    it("dovrebbe chiamare next con errore se si verifica un'eccezione", async () => {
      const error = new Error("Database error");
      findAllStub = sinon.stub(User, "findAll").throws(error);

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
});
