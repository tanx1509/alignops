import { NextRequest } from 'next/server'
import { DomainError } from '@/lib/errors/domain.errors'

export type RouteHandler<
  P extends Record<string, string> = Record<string, string>,
> = (request: NextRequest, context: { params: P }) => Promise<Response>

export function withErrorHandling<
  P extends Record<string, string> = Record<string, string>,
>(handler: RouteHandler<P>): RouteHandler<P> {
  return async (
    request: NextRequest,
    context: { params: P },
  ): Promise<Response> => {
    try {
      return await handler(request, context)
    } catch (err) {
      if (err instanceof DomainError) {
        return Response.json(
          {
            error: {
              code: err.code,
              message: err.message,
            },
          },
          { status: err.statusCode },
        )
      }

      console.error('[UnhandledError]', {
        name: err instanceof Error ? err.name : 'Unknown',
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        method: request.method,
        url: request.url,
      })

      return Response.json(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message:
              err instanceof Error
                ? err.message
                : String(err),
          },
        },
        { status: 500 },
      )
    }
  }
}
