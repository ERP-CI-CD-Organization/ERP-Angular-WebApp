import { environment } from './../../environments/environment';
import { BranchSettings } from './../models/branchSettings';
import { Injectable } from '@angular/core';
import * as signalR from '@aspnet/signalr';
import { HttpClient } from '@angular/common/http';
import { pipe } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class SignalRService {
public data: BranchSettings;
public connectionId: string;
private hubConnection: signalR.HubConnection;
private baseUrl: string ;

constructor(private http: HttpClient) {
  this.baseUrl = environment.erpApiUrl;
 }
public startConnection = () => {
  this.hubConnection = new signalR.HubConnectionBuilder()
                           .withUrl(this.baseUrl + '/AdvancedSetting', {
                            skipNegotiation: true,
                            transport: signalR.HttpTransportType.WebSockets})
                           .build();

  this.hubConnection
  .start()
  .then(() => {
    console.log('开启signal-r连接');
    this.hubConnection.invoke('getConnectionId') // call AdvancedSettingHub's function "GetConnectionId",since we're in js/ts environment,
                                                // fitst character need to be lowwer case
    .then( (connectionId) => {
     this.connectionId = connectionId; // assign connectionId(from api) to connectionId(local)
     this.joinInGroup(connectionId);
     console.log('receivedConnectionId:', connectionId);
    });
  })
  .catch(error => console.log('signal-r连接错误！提示:' + error));
}




  ActivateBranchSettingsDataListener(branchId: string) {
    console.log('branchId:' + branchId);
    this.hubConnection.on('branchSettings-' + branchId, (data) => { // listening on branchSettings
      console.log('signal-r从服务端取得：', data);
    });
  }
  // join in group just like join in chat room
  joinInGroup(connectionId: string): void  { 
    this.http.post(this.baseUrl + '/AdvancedSetting/JoinGroup/' + connectionId, {}).subscribe(() => {
      console.log('group joined');
    }, error => {
      console.log(error);
    });
  }
}
