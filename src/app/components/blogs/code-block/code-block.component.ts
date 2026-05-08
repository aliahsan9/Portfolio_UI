import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-code-block',
  standalone: true,
  templateUrl: './code-block.component.html',
  styleUrls: ['./code-block.component.css']
})
export class CodeBlockComponent {

  @Input() code = '';
  @Input() language = 'csharp';

  copied = false;

  copyCode() {
    navigator.clipboard.writeText(this.code);

    this.copied = true;

    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}