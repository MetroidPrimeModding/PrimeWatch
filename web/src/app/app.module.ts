import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CanvasComponent } from './canvas/canvas.component';
import { MemoryObjectComponent } from './memoryView/memory-object/memory-object.component';
import { MemoryRootComponent } from './memoryView/memory-root/memory-root.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatTreeModule} from "@angular/material/tree";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {CdkTreeModule} from "@angular/cdk/tree";
import {MatTabsModule} from "@angular/material/tabs";
import { WorldComponent } from './world/world.component';
import { EntitiesComponent } from './entities/entities.component';
import { InfoDisplayComponent } from './info-display/info-display.component';
import { SelectedObjectComponent } from './selected-object/selected-object.component';

@NgModule({
  declarations: [
    AppComponent,
    TopBarComponent,
    CanvasComponent,
    MemoryObjectComponent,
    MemoryRootComponent,
    WorldComponent,
    EntitiesComponent,
    InfoDisplayComponent,
    SelectedObjectComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatDividerModule,
    MatListModule,
    MatToolbarModule,
    MatTreeModule,
    MatButtonModule,
    MatIconModule,
    CdkTreeModule,
    MatTabsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
