let errorService = {
  validationError: async (msg) => {
    let ex = new Error(msg || "Missing valid required input");
    ex.name = "ValidationError";
    throw ex;
  },

  unauthorize: async (msg) => {
    let ex = new Error(msg || "Unauthorize");
    ex.name = "Unauthorize";
    throw ex;
  },
};

module.exports = errorService;
