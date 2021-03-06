import { Injectable } from '@angular/core'
import { AuthService } from '@services/auth/auth.service'
import { User } from '@models/auth/user'
import { Observable, of } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { authApiUrl } from '@app/app.constants'
import { catchError, map, tap } from 'rxjs/operators'
import { OAuthService } from 'angular-oauth2-oidc'
import { authConfig } from '@app/auth.config'
import { fromPromise } from 'rxjs/internal-compatibility'

@Injectable({
  providedIn: 'root'
})
export class AddAuthService implements AuthService {
  isUserLoggedIn = false
  user: User

  constructor(private httpClient: HttpClient,
              private oauthService: OAuthService) {
    this.oauthService.configure(authConfig)
  }

  get isUserLoggedIn$(): Observable<boolean> {
    const request$ = this.isUserLoggedIn ?
      this.httpClient.get(authApiUrl) :
      this.httpClient.get<User>(`${authApiUrl}/user`)
        .pipe(
          tap(user => {
            this.isUserLoggedIn = true;
            this.user = user
            this.oauthService.setupAutomaticSilentRefresh()
          })
        )
    return request$
      .pipe(
        map(() => true),
        catchError(() => of(false))
      )
  }

  login(): Observable<boolean> {
    return fromPromise(this.oauthService.loadDiscoveryDocumentAndLogin())
  }

  logout(): Observable<void> {
    this.oauthService.logOut()
    this.user = null
    this.isUserLoggedIn = false
    return of()
  }

  recoverPassword(email: string): Observable<void> {
    throw new Error('Not supported')
  }

  refreshToken(email, token): Observable<User> {
    throw new Error('Not supported')
  }

  register(user: User): Observable<void> {
    throw new Error('Not supported')
  }

  reset(password: string, token: string): Observable<void> {
    throw new Error('Not supported')
  }
}
