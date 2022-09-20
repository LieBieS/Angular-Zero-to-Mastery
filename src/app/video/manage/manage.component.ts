import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalService } from 'src/app/services/modal.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import IClip from 'src/app/models/clip';
import { ClipService } from 'src/app/services/clip.service';
import { BehaviorSubject } from 'rxjs';
@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  videoOrder: string = '1';
  clipsCollection!: IClip[];
  activeClip: IClip | null = null;
  sort$: BehaviorSubject<string>;

  constructor(private router: Router, private route: ActivatedRoute, private clipSrv: ClipService, private modal: ModalService) {
    this.sort$ = new BehaviorSubject(this.videoOrder)
  }


  ngOnInit(): void {
    this.route.queryParams.subscribe((params: Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1';
      this.sort$.next(this.videoOrder);
    });
    this.getDocs();
  }

  async getDocs() {
    this.clipSrv.retrieveClips(this.sort$).subscribe(data => {
      this.clipsCollection = [];
      data.forEach(doc => {
        this.clipsCollection.push({
          docID: doc.id,
          ...doc.data()
        });
      });
    });
  }

  sort(e: Event) {
    const { value } = (e.target as HTMLSelectElement);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    })

  }
  update(e: IClip) {
    this.clipsCollection.forEach((element, index) => {
      if (element.docID = e.docID) {
        this.clipsCollection[index].title = e.title;
      }
    })
  }

  deleteClip(e: Event, clip: IClip) {
    e.preventDefault();
    this.clipSrv.deleteClip(clip)
    this.clipsCollection.forEach((element, index) => {
      if (element.docID == clip.docID) {
        this.clipsCollection.splice(index, 1);
      }
    })
  }
  openModal(e: Event, clip: IClip) {
    e.preventDefault();
    this.activeClip = clip;
    this.modal.toggleModal('editClip');
  }
}
