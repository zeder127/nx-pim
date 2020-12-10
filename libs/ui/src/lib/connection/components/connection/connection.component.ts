import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit
} from '@angular/core';


@Component({
  selector: 'pim-connection',
  templateUrl: './connection.component.html',
  styleUrls: ['./connection.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConnectionComponent implements OnInit {
  @Input('start') startPointId: string;
  @Input('end') endPointId: string;

  constructor() {}

  ngOnInit(): void {

  }


}
