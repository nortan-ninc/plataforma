import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlatformConfig } from '@models/platformConfig';
import { CommonTestingModule } from 'common-testing.module';

import { ConfigComponent } from './config.component';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;

  CommonTestingModule.setUpTestBed(ConfigComponent);

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    component.config = new PlatformConfig();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
