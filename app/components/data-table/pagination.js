import Component from '@glimmer/component';

const more = -1;

export default class DataTablePaginationComponent extends Component {
  get isSmall() {
    return this.args.textSize == 'small';
  }

  get textSizeClass() {
    if (this.isSmall) {
      return 'text-xs';
    } else {
      return 'text-sm';
    }
  }

  get page() {
    return this.args.page || 0;
  }

  get size() {
    return this.args.size || 20;
  }

  get start() {
    return this.args.total == 0 ? 0 : this.page * this.size + 1;
  }

  get end() {
    const end = this.page * this.size + this.size;
    return end > this.args.total ? this.args.total : end;
  }

  get hasPrevious() {
    return this.page > 0;
  }

  get hasNext() {
    return this.end < this.args.total;
  }

  get firstPage() {
    return 0;
  }

  get lastPage() {
    return Math.floor((this.args.total - 1) / this.size); // page is zero-based
  }

  get nbOfPages() {
    return this.lastPage + 1;
  }

  get hasMultiplePages() {
    return this.nbOfPages > 1;
  }

  /**
   * Page selectors to show
   * Examples:  (~x~ indicates current page, more indicates ellipsis)
   * [~1~, 2, 3, more, 8, 9, 10]
   * [1, 2, 3, more, 8, 9, ~10~]
   * [1, more, 5, 6, ~7~, 8, 9, 10]
   * [1, more, 3, 4, ~5~, 6, 7, more, 10]
   * [1, more, 7, 8, ~9~, 10]
   */
  get pages() {
    if (this.nbOfPages > 0) {
      if (this.args.page == this.firstPage || this.args.page == this.lastPage) {
        const x = this.firstPage;
        const leftWindow = [x, x + 1, x + 2].filter((i) => i <= this.lastPage);
        const y = this.lastPage;
        const rightWindow = [y - 2, y - 1, y].filter((i) => i >= this.firstPage);
        const pages = [...leftWindow, ...rightWindow].uniq().sort(function (a, b) {
          return a - b;
        });
        if (pages.length == 6 && pages[2] < pages[3] - 1) {
          return [...leftWindow, more, ...rightWindow];
        } else {
          return pages;
        }
      } else {
        const x = this.args.page;
        const currentPageWindow = [x - 2, x - 1, x, x + 1, x + 2].filter(
          (i) => i >= this.firstPage && i <= this.lastPage
        );
        let prepend = [];
        let append = [];
        if (currentPageWindow.length) {
          const first = currentPageWindow[0];
          if (first > this.firstPage) {
            prepend = first == this.firstPage + 1 ? [this.firstPage] : [this.firstPage, more];
          }
          const last = currentPageWindow[currentPageWindow.length - 1];
          if (last < this.lastPage) {
            append = last == this.lastPage - 1 ? [this.lastPage] : [more, this.lastPage];
          }
        }
        return [...prepend, ...currentPageWindow, ...append];
      }
    } else {
      return [this.firstPage];
    }
  }
}
