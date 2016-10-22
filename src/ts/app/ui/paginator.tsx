module manticore.ui.paginator {
    
    function Pager(props: {currentPage: number, pages: number[], onPageClick: (n: number)=>void}) {
        const prev = <a href="#" onClick={ev => { props.onPageClick(props.currentPage - 1); ev.preventDefault(); }}>◀︎</a>;
        const next = <a href="#" onClick={ev => { props.onPageClick(props.currentPage + 1); ev.preventDefault(); }}>▶</a>;

        return (
            <ol>
                <li className="prev">{ props.currentPage <= 1 ? <span>◀︎</span> : prev }</li>

                { props.pages.map(p => (
                    <li className={p === props.currentPage ? "current" : ""}>
                        <a href="#" onClick={ev => { props.onPageClick(p); ev.preventDefault(); }}>{p + 1}</a>
                    </li>
                )) }

                <li className="next">{ props.currentPage === props.pages[props.pages.length - 1] ? <span>▶︎</span> : next }</li>
            </ol>
        );
    }

    interface PaginatorProps { 
        data: any[];
        pageSize: number;
        render: (v: any) => React.ReactNode
    }

    interface PaginatorState {
        page: number;
    }

    export class Paginator extends React.Component<PaginatorProps, PaginatorState> {
        constructor (props: PaginatorProps) {
            super(props);

            this.state = { page: 0 };            
        }

        public render () {
            
            const start = this.props.pageSize * this.state.page;
            const end = start + this.props.pageSize;

            const dataWindow = this.props.data.slice(start, end);

            if (this.props.pageSize > this.props.data.length) {
                return (
                    <div className="C paginator">
                        <ul>
                        { dataWindow.map(this.props.render) }
                        </ul>
                    </div>
                );
            }

            return (
                <div className="C paginator">
                    <header>
                        <Pager currentPage={ this.state.page }
                               pages={ this.pageList() } 
                               onPageClick={ n => this.changePage(n) } />
                    </header>

                    <ul>
                    { dataWindow.map(this.props.render) }
                    </ul>

                    <footer>
                        <Pager currentPage={ this.state.page }
                               pages={ this.pageList() } 
                               onPageClick={ n => this.changePage(n) } />
                    </footer>
                </div>
            );
        }

        private pageList():number[] {
            const pages:number[] = [];

            const halfWindow = 5;

            const lower = Math.max(this.state.page - halfWindow, 0);
            const max = Math.ceil(this.props.data.length / this.props.pageSize);
            const upper = Math.min(lower + (2 * halfWindow), max);

            for (var i = lower; i < upper; i++) {
                pages[i] = i;
            }
            return pages;
        }

        private changePage(n: number) {
            this.setState({ page: n });
        }
    }
}