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

import { Component } from '@angular/core';
import { Task } from './task/task';
import { CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import {
  TaskDialogResult,
  TaskDialogComponent,
} from './task-dialog/task-dialog.component';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-root',
  template: `
    <mat-toolbar color="primary">
      <mat-icon>local_fire_department</mat-icon>
      <span>Kanban Fire</span>
    </mat-toolbar>

    <div class="content-wrapper">
      <button (click)="newTask()" mat-button>
        <mat-icon>add</mat-icon> Add Task
      </button>

      <div class="container-wrapper">
        <div class="container">
          <h2>Backlog</h2>

          <mat-card
            cdkDropList
            id="todo"
            #todoList="cdkDropList"
            [cdkDropListData]="todo | async"
            [cdkDropListConnectedTo]="[doneList, inProgressList]"
            (cdkDropListDropped)="drop($event)"
            class="list"
          >
            <p class="empty-label" *ngIf="(todo | async)?.length === 0">
              Empty list
            </p>
            <app-task
              (edit)="editTask('todo', $event)"
              *ngFor="let task of todo | async"
              cdkDrag
              [task]="task"
            ></app-task>
          </mat-card>
        </div>

        <div class="container">
          <h2>In progress</h2>

          <mat-card
            cdkDropList
            id="inProgress"
            #inProgressList="cdkDropList"
            [cdkDropListData]="inProgress | async"
            [cdkDropListConnectedTo]="[todoList, doneList]"
            (cdkDropListDropped)="drop($event)"
            class="list"
          >
            <p class="empty-label" *ngIf="(inProgress | async)?.length === 0">
              Empty list
            </p>
            <app-task
              (edit)="editTask('inProgress', $event)"
              *ngFor="let task of inProgress | async"
              cdkDrag
              [task]="task"
            ></app-task>
          </mat-card>
        </div>

        <div class="container">
          <h2>Done</h2>

          <mat-card
            cdkDropList
            id="done"
            #doneList="cdkDropList"
            [cdkDropListData]="done | async"
            [cdkDropListConnectedTo]="[todoList, inProgressList]"
            (cdkDropListDropped)="drop($event)"
            class="list"
          >
            <p class="empty-label" *ngIf="(done | async)?.length === 0">
              Empty list
            </p>
            <app-task
              (edit)="editTask('done', $event)"
              *ngFor="let task of done | async"
              cdkDrag
              [task]="task"
            ></app-task>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  todo = this.store.collection('todo').valueChanges({ idField: 'id' });
  inProgress = this.store
    .collection('inProgress')
    .valueChanges({ idField: 'id' });
  done = this.store.collection('done').valueChanges({ idField: 'id' });

  constructor(private dialog: MatDialog, private store: AngularFirestore) {}

  newTask(): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task: {},
      },
    });
    dialogRef
      .afterClosed()
      .subscribe((result: TaskDialogResult) =>
        this.store.collection('todo').add(result.task)
      );
  }

  editTask(list: 'done' | 'todo' | 'inProgress', task: Task): void {
    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '270px',
      data: {
        task,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: TaskDialogResult) => {
      if (result.delete) {
        this.store.collection(list).doc(task.id).delete();
      } else {
        this.store.collection(list).doc(task.id).update(task);
      }
    });
  }

  drop(event: CdkDragDrop<Task[]>): void {
    try {
      console.log('CDK drop event ', event);
      if (event.previousContainer === event.container) {
        return;
      }
      const item = event.previousContainer.data[event.previousIndex];
      this.store.firestore.runTransaction(() => {
        const promise = Promise.all([
          this.store
            .collection(event.previousContainer.id)
            .doc(item.id)
            .delete(),
          this.store.collection(event.container.id).add(item),
        ]);
        return promise;
      });
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } catch (error) {
      console.log('CDK drop error occured:- ', error);
    }
  }
}
