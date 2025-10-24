import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const snackBar = inject(MatSnackBar);
    
    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unknown error occurred';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = error.error.message;
            } else {
                // Server-side error
                switch (error.status) {
                    case 401:
                        errorMessage = 'Unauthorized access';
                        break;
                    case 403:
                        errorMessage = 'Forbidden access';
                        break;
                    case 404:
                        errorMessage = 'Resource not found';
                        break;
                    case 422:
                        errorMessage = 'Validation failed';
                        break;
                    case 500:
                        errorMessage = 'Server error';
                        break;
                    default:
                        errorMessage = `Error: ${error.message}`;
                }
            }

            // Show error in snackbar
            snackBar.open(errorMessage, 'Close', {
                duration: 5000,
                horizontalPosition: 'center',
                verticalPosition: 'bottom',
            });

            console.error(errorMessage);
            return throwError(() => new Error(errorMessage));
        })
    );
};