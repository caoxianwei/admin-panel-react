import React, { Component } from 'react';
import './TableSettings.css';
import _ from 'lodash';

import { SetPreference } from './../../Utils/preference.utils';

import { changeArrayPosition } from './../../Utils/js.utils';

import { Collapse, Card, CardBody, ListGroup, ListGroupItem, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';

import Switch from './../../Components/Forms/Components/Switch/switch';
// import ColumnSetting from './Components/ColumnSetting/columnSetting.component';
import ColumnSetting from './Components/Column-Setting/columnSetting.component';

export default class TableSettings extends Component {

    constructor(props) {
        super(props);

        this.state = {
            modal: false,
            selectedColumns: this.props.selectedColumns || [],
            tempSelectedColumns: this.props.selectedColumns || [],
            columns: this.props.columns,
            list: {},
            activeColumn: {},
        }
    }

    componentDidMount() {
    }

    componentWillReceiveProps(nextProps) {
    }

    toggleModal = () => {
        this.setState({ modal: !this.state.modal, activeColumn: {}, tempSelectedColumns: this.props.selectedColumns })
    }

    toggleList = (index) => {
        var obj = this.state.list;
        obj[index] = !obj[index];
        this.setState({ list: obj });
    }

    addColumn = (column) => {
        var selectedColumns = this.state.tempSelectedColumns;

        selectedColumns.unshift({
            column: column.parent + "." + column.id, headingCollapsed: true, heading: ""
        });

        this.setState({ tempSelectedColumns: selectedColumns })
    }

    removeColumn = (column) => {
        var selectedColumns = this.state.tempSelectedColumns;

        selectedColumns = selectedColumns.filter((entry) => (entry.column != column.column));

        this.setState({ tempSelectedColumns: selectedColumns })
    }

    toggleColumn = (column) => {
        column.expanded = !column.expanded
    }

    selectColumn = (column, index) => {
        if (typeof column != 'string') {
            column.index = index;
            this.setState({ activeColumn: column });
        }
    }

    moveSelectedUp = () => {
        this.moveSelectedItem(-1);
    }

    moveSelectedDown = () => {
        this.moveSelectedItem(1);
    }

    moveSelectedItem = (key) => {
        var activeColumn = this.state.activeColumn;
        var index = this.state.activeColumn.index;
        var result = changeArrayPosition(this.state.tempSelectedColumns, index, index + key)
        activeColumn.index = result.index;
        this.setState({ tempSelectedColumns: result.array, activeColumn: activeColumn });
    }

    addSplit = () => {
        var ext = Math.floor(Math.random() * 1000);
        var selectedColumns = this.state.tempSelectedColumns;
        selectedColumns.unshift("e-split-" + ext);

        selectedColumns.unshift("s-split-" + ext);
        this.setState({ selectedColumns });
    }

    applyChanges = async () => {
        const result = await SetPreference(this.props.listName, this.state.tempSelectedColumns);
        result.success ? this.setState({ modal: !this.state.modal }) : null;
        this.props.onSubmit(this.state.tempSelectedColumns);
    }

    modalWrapper() {
        const { columns, tempSelectedColumns, activeColumn } = this.state;

        const selectedIds = [];

        for (var value of tempSelectedColumns) {
            if (typeof value != 'string') {
                selectedIds.push(parseInt(value.column.split('.').pop()));
            }
        }

        const leftColumns = _.groupBy(columns, 'parent');

        const columnKeys = Object.keys(leftColumns);

        for (var key of columnKeys) {
            leftColumns[key] = leftColumns[key].filter((column) => (
                selectedIds.indexOf(column.id) == -1
            ));
        }
        return (
            <Modal size="lg" isOpen={this.state.modal} toggle={this.toggleModal} className="table-settings">
                <ModalHeader toggle={this.toggleModal}>
                    Configure
            </ModalHeader>
                <ModalBody>
                    <div className="left">

                        <div className="card" >
                            <div className="card-body parent-card">

                                <div className="card-top">
                                    <h6 className="card-title">All Columns</h6>

                                    <div className="input-holder">
                                        <input type="text" className="search-box" placeholder="Search Columns" />
                                    </div>
                                </div>

                                <ListGroup className="parent-group">
                                    {
                                        columnKeys.map((column, index) => (
                                            <div key={index}>

                                                <div className="column-group" onClick={() => this.toggleList(column)}>
                                                    <div className="column-label">
                                                        {column}
                                                    </div>
                                                    <div className="icon-holder">
                                                        <i className={`fa ${!this.state.list[column] ? 'fa-plus' : 'fa-minus'}`} aria-hidden="true"></i>
                                                    </div>
                                                </div>

                                                <Collapse isOpen={this.state.list[column]} className="columns-wrapper">


                                                    <ListGroup className="inner-columns">
                                                        {
                                                            leftColumns[column].map((entry, key) => (

                                                                <div key={key} className="column-group" onDoubleClick={() => this.addColumn(entry)} >
                                                                    <div className="column-label">
                                                                        {entry.column_name}
                                                                    </div>
                                                                    <div className="icon-holder">
                                                                        <button className="add-column btn btn-sm btn-light" onClick={() => this.addColumn(entry)} >
                                                                            <i className="fa fa-external-link-square" aria-hidden="true"></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))
                                                        }
                                                    </ListGroup>
                                                </Collapse>
                                            </div>
                                        ))
                                    }
                                </ListGroup>

                            </div>
                        </div>


                    </div>

                    <div className="controls">
                        <Button color="primary" size="sm" onClick={this.moveSelectedUp}>
                            <i className="fa fa-arrow-up"></i>
                        </Button>

                        <Button color="primary" size="sm" onClick={this.moveSelectedDown}>
                            <i className="fa fa-arrow-down"></i>
                        </Button>
                    </div>

                    <div className="right">

                        <div className="card">
                            <div className="card-body parent-card">
                                <div className="card-top">
                                    <h6 className="card-title">Selected Columns</h6>
                                </div>

                                <ListGroup className="parent-group">
                                    {
                                        tempSelectedColumns.map((column, index) => {
                                            return ((typeof column == 'string') ?
                                                <ListGroupItem tag="button" action key={index}>
                                                    ---- {column} ----
                                        </ListGroupItem>
                                                :
                                                // Component Manages column props
                                                <ColumnSetting removeColumn={this.removeColumn} columns={columns} activeColumn={activeColumn} selectColumn={this.selectColumn} column={column} index={index} key={index} />
                                                // Column Setting Ends
                                            )
                                        })
                                    }
                                </ListGroup>

                            </div>
                        </div>
                    </div>

                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onClick={this.applyChanges}>Apply Changes</Button>
                    <Button color="secondary" onClick={this.toggleModal}>Cancel</Button>
                </ModalFooter>
            </Modal >
        )
    }

    render() {
        return (
            <div className="table-settings">
                <Button color="secondary" size="sm" onClick={this.toggleModal}>
                    <i className="fa fa-cog"></i>
                </Button>

                {
                    this.state.modal &&
                    this.modalWrapper()
                }
            </div>
        )
    }
}



