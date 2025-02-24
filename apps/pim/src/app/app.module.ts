import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MsalAngularConfiguration,
  MsalInterceptor,
  MsalModule,
  MsalService,
  MSAL_CONFIG,
  MSAL_CONFIG_ANGULAR,
} from '@azure/msal-angular';
import { Configuration } from 'msal';
import { SortablejsModule } from 'ngx-sortablejs';
import { ToastModule } from 'primeng/toast';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoreModule } from './core/core.module';
3;

export const protectedResourceMap: [string, string[]][] = [
  ['https://graph.microsoft.com/v1.0/me', ['user.read']],
  ['https://dev.azure.com', ['499b84ac-1321-427f-aa17-267ca6975798/user_impersonation']],
];

function MSALConfigFactory(): Configuration {
  return {
    auth: {
      clientId: '554ef540-a01b-44f8-80a4-639b9caa910c',
      authority:
        'https://login.microsoftonline.com/0d8f4db4-138f-4787-9039-288f464bdd15/',
      validateAuthority: true,
      redirectUri: 'http://localhost:4200/',
      postLogoutRedirectUri: 'http://localhost:4200/',
      navigateToLoginRequestUrl: true,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false, // set to true for IE 11
    },
  };
}

function MSALAngularConfigFactory(): MsalAngularConfiguration {
  return {
    popUp: true,
    consentScopes: [
      'user.read',
      'openid',
      'profile',
      'api://499b84ac-1321-427f-aa17-267ca6975798/user_impersonation',
    ],
    unprotectedResources: ['https://www.microsoft.com/en-us/'],
    protectedResourceMap,
    extraQueryParameters: {},
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MsalModule,
    CoreModule,
    SortablejsModule.forRoot({ animation: 250 }),
    ToastModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true,
    },
    {
      provide: MSAL_CONFIG,
      useFactory: MSALConfigFactory,
    },
    {
      provide: MSAL_CONFIG_ANGULAR,
      useFactory: MSALAngularConfigFactory,
    },
    MsalService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
