import { Request, Response } from "express";
import { logger } from "@/core/config/logger";
import { mapErrorToHttpResponse } from "@/core/http";
import { Controller, HttpRequest } from "@/core/protocols";

const NO_CONTENT = 204;

type RequestWithValidatedQuery = Request & { validatedQuery?: unknown };

/** Campos opcionais injetados por middlewares Express (auth, correlation-id). */
type ExpressRequestWithContext = RequestWithValidatedQuery & {
  correlationId?: string;
  user?: HttpRequest["user"];
};

const adaptRoute = (controller: Controller) => {
  return async function (req: Request, res: Response) {
    const r = req as ExpressRequestWithContext;
    const httpRequest: HttpRequest = {
      body: req.body,
      params: req.params,
      query: req.query,
      validatedQuery: r.validatedQuery,
      headers: req.headers,
      user: r.user,
      correlationId: r.correlationId,
      pathParams: req.params,
    };
    try {
      const httpResponse = await controller.handle(httpRequest);

      if (httpResponse.statusCode === NO_CONTENT) {
        return res.status(NO_CONTENT).send();
      }

      res.status(httpResponse.statusCode).json(httpResponse.body);
    } catch (error) {
      const correlationId = httpRequest.correlationId;
      logger.error("Erro não tratado no adaptador de rota Express", {
        correlationId,
        error,
      });
      const httpResponse = mapErrorToHttpResponse(error, correlationId);
      res.status(httpResponse.statusCode).json(httpResponse.body);
    }
  };
};

export default adaptRoute;
