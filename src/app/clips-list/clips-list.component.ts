import { Component, OnInit, OnDestroy , Input} from '@angular/core';
import { ClipService } from '../services/clip.service';
import { DatePipe } from '@angular/common';
@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  // Injectable pipe
  providers: [DatePipe]
})
export class ClipsListComponent implements OnInit, OnDestroy {
@Input() scrollable = true;
  constructor(public clipsSrv:ClipService) { 
    this.clipsSrv.getClips();
  }
  ngOnDestroy(): void {
    if (this.scrollable) {
    window.removeEventListener('scroll', this.handleScroll);
    }
    this.clipsSrv.pageClips = [];


  }

  ngOnInit(): void {
    if(this.scrollable){
      window.addEventListener('scroll', this.handleScroll)
    }
  }
  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement;
    const { innerHeight } = window;
    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight;
    if (bottomOfWindow) {
      this.clipsSrv.getClips();
    };
  }
}
