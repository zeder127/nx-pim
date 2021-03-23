import { Component, OnInit } from '@angular/core';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { CryptoUtils, Logger } from 'msal';

@Component({
  selector: 'pim-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  public loggedIn = false;
  public userName: string;

  constructor(
    private broadcastService: BroadcastService,
    private authService: MsalService
  ) {}

  ngOnInit(): void {
    this.checkoutAccount();

    this.broadcastService.subscribe('msal:loginSuccess', () => {
      this.checkoutAccount();
    });

    this.authService.handleRedirectCallback((authError, response) => {
      if (authError) {
        console.error('Redirect Error: ', authError.errorMessage);
        return;
      }

      console.log('Redirect Success: ', response);
    });

    this.authService.setLogger(
      new Logger(
        (logLevel, message, piiEnabled) => {
          console.log('MSAL Logging: ', message);
        },
        {
          correlationId: CryptoUtils.createNewGuid(),
          piiLoggingEnabled: false,
        }
      )
    );
  }

  login() {
    const isIE =
      window.navigator.userAgent.indexOf('MSIE ') > -1 ||
      window.navigator.userAgent.indexOf('Trident/') > -1;

    if (isIE) {
      this.authService.loginRedirect();
    } else {
      this.authService.loginPopup();
    }
  }

  logout() {
    this.authService.logout();
  }

  checkoutAccount() {
    this.loggedIn = !!this.authService.getAccount();
    this.userName = this.authService.getAccount()?.name;
    // this.authService.acquireTokenSilent({scopes: ['499b84ac-1321-427f-aa17-267ca6975798/.default']}).then(response => {
    //   console.log("🚀 ~ file: app.component.ts ~ line 47 ~ AppComponent ~ checkoutAccount ~ token", response)

    // })
  }
}
