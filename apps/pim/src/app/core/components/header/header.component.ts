import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BroadcastService, MsalService } from '@azure/msal-angular';
import { AutoUnsubscriber } from '@pim/ui';
import { CryptoUtils, Logger } from 'msal';
import { MenuItem } from 'primeng/api';
import { filter } from 'rxjs/operators';
import { PiService } from '../../../shared/services/pi.service';

@Component({
  selector: 'pim-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent extends AutoUnsubscriber implements OnInit {
  public loggedIn = false;
  public userName: string;
  public currentPiName: string;
  public currentFeature = 'planning';
  public currentTeamName: string;
  public piMenuItems: MenuItem[];

  constructor(
    private broadcastService: BroadcastService,
    private authService: MsalService,
    private piService: PiService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        const params = this.getParams(this.route);
        this.currentPiName = params['piName'];
      }
      this.loadPiMenuItems();
    });

    this.loadPiMenuItems();
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

  private loadPiMenuItems() {
    this.piService
      .getPisAsync()
      .pipe(
        this.autoUnsubscribe(),
        filter((pis) => !!pis)
      )
      .subscribe((pis) => {
        this.piMenuItems = pis.map((pi) => {
          if (pi.name === this.currentPiName)
            return {
              label: pi.name,
              disabled: true,
            };
          else
            return {
              label: pi.name,
              routerLink: `${this.currentFeature}/${pi.name}/switcher`,
            };
        });
        this.piMenuItems.push({
          label: 'New PI',
          icon: 'pi pi-plus',
          routerLink: 'admin/pi/new',
        });
      });
  }

  /**
   * Get route parameters from outside router-outlet
   * @param route
   * @returns
   */
  private getParams(route: ActivatedRoute) {
    let params = route.snapshot.params;
    params = { ...route.snapshot.queryParams, ...params };
    if (route.children) {
      for (const r of route.children) {
        params = { ...this.getParams(r), ...params };
      }
    }
    return params;
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
