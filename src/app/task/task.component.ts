/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Task } from './task';

@Component({
  selector: 'app-task',
  template: `
    <mat-card class="item" (dblclick)="edit.emit(task)">
      <h2>{{ task?.title }}</h2>
      <p>
        {{ task?.description }}
      </p>
    </mat-card>
  `,
  styleUrls: ['./task.component.css'],
})
export class TaskComponent {
  @Input() task: Task;
  @Output() edit = new EventEmitter<Task>();
}
