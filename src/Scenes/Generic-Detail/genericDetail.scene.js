import React, { Component } from 'react';

import {
    Card, CardImg, CardText, CardBody,
    CardTitle, CardSubtitle, Button,
    Container,
    Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, Table
} from 'reactstrap';

import DetailPortlet from './../../Components/Detail-Portlet/DetailPortlet.component';
import DetailIncludes from './../../Components/Detail-Includes/DetailIncludes';
import TableSettings from './../../Components/Table-Settings/TableSettings.component';
import CustomAction from './../../Components/Custom-Action/CustomAction.component';

import { GetUrlParams } from './../../Utils/location.utils';
import { GetMenuDetail, ConvertMenuDetailForGenericPage, CreateFinalColumns } from './../../Utils/generic.utils';
import { GetDetailRecord } from './../../Utils/genericDetail.utils';
import { createFinalObject } from './../../Utils/table.utils';

import './genericDetail.css';

export default class GenericDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            ...GetUrlParams(this.props), // params, queryString
            menuDetail: {},
            portlet: {},
            tabs: {},
            tabsPreference: {}
        };
    }

    componentDidMount() {
        this.getMenuData();
    }

    getMenuData = async () => {
        const { queryString } = this.state;
        // const { menuId } = queryString;
        const { menuId } = this.props;
        const result = await GetMenuDetail(menuId);
        if (result.success) {
            const { response = {} } = result;
            const menuDetail = ConvertMenuDetailForGenericPage(response || {});
            if (typeof response.controller_path == 'string' && response.controller_path.includes('genericListingController.js') != -1) {
                menuDetail.listName = menuDetail.stateName.toLowerCase();
                this.setState({ menuDetail });
                this.getDetailRecord();
            }
        }
    }

    getDetailRecord = () => {
        const { menuDetail, genericData, urlParameter, params } = this.state;
        // const {menuId} = this.props
        GetDetailRecord({ configuration: menuDetail, callback: this.dataFetched, data: genericData, urlParameter: params });
    }

    dataFetched = ({ tabs, portlet }) => {
        tabs.refreshContent = this.getDetailRecord;
        this.setState({ portlet, tabs });
    }

    getColumn = (preference, dictionary) => {
        // return preference.column
    }

    layoutChanges = (changes) => {
        let { portlet, menuDetail } = this.state;
        // portlet.finalColumns = changes;
        // menuDetail.preference['menudef.detail.list'] = JSON.stringify(changes);
        menuDetail.preference[portlet.listPortlet] = JSON.stringify(changes);
        portlet.finalColumns = CreateFinalColumns(portlet.portletColumns, changes);
        this.setState({ portlet, menuDetail });
    }

    render() {
        const { history } = this.props;
        const { menuDetail = {}, portlet = {}, tabs = {} } = this.state;
        const { finalColumns = [], data = {} } = portlet;
        let selectedColumns = {};

        if (menuDetail.preference && portlet.listPortlet) {
            selectedColumns = JSON.parse(menuDetail.preference[portlet.listPortlet])
        }

        const genericDataForCustomColumn = {
            columns: portlet.portletColumns,
            formPreference: menuDetail.preference ? JSON.parse(menuDetail.preference[menuDetail.formPreferenceName + '.form']) : [],
            modelName: menuDetail.formPreferenceName + '.form',
            module: menuDetail.url ? menuDetail.url.split("/:")[0] : '',
            dataModel: menuDetail.model,
            methods: portlet.methods,
            preDefinedmethods: portlet.preDefinedmethods
        };

        return (
            <div className="generic-detail-container">

                <div className="header">
                    <div className="left" />

                    <div className="right">
                        <div className="btn-group" id="generic-detail-header-dynamic-icon-group">
                            <CustomAction history={history} genericData={genericDataForCustomColumn} actions={menuDetail.nextActions} listingRow={data} placement={167} callback={this.getDetailRecord} />
                        </div>

                        {
                            portlet.portletColumns ?
                                <TableSettings onSubmit={this.layoutChanges} listName={portlet.listName} selectedColumns={selectedColumns} columns={portlet.portletColumns} finalColumns={finalColumns} />
                                : null
                        }
                    </div>
                </div>

                {
                    finalColumns.length ?
                        <DetailPortlet data={data} finalColumns={finalColumns} />
                        : null
                }

                {
                    tabs && tabs.includes ?
                        <DetailIncludes history={history} tabs={tabs} callback={this.getDetailRecord}/>
                        : null
                }
            </div>
        )
    }
}