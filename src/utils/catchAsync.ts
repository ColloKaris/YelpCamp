import { Request, Response, NextFunction} from 'express';

// Wrapper function to prevent us writing try...catch several times
export function wrapAsync(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  }
}