import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip';
import { ClipService } from '../services/clip.service';
@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class ClipComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef;
  player?: videojs.Player;
  clip?: IClip;

  constructor(public route: ActivatedRoute, private clipSrv: ClipService) { }

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement);

    this.route.data.subscribe(data => {
      this.clip = data.clip as IClip;
      this.player?.src({ src: this.clip.clipURL, type: 'video/mp4' })
    });

  }

}
