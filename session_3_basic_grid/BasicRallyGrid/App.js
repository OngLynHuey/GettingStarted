// Custom Rally App that displays Stories in a grid.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

	defectStore: undefined,
	defectGrid: undefined,

    // Entry Point to App
    launch: function() {

      console.log('our second app');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      
	//we create a pull down container
	this.pulldownContainer = Ext.create('Ext.container.Container', {
		id: 'pulldown-container-id',
		layout: {
			 type: 'hbox',
			 align: 'stretch'
			},
		}); 

	//we need to prefix with this so we call a method found at the app level
	this.add(this.pulldownContainer);
	this._loadIterations();
	},

	//for load iteration part coding
	_loadIterations: function() {
       	this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
		fieldLabel: 'Iteration',
		labelAlign: 'right',
		width: 300,
		listeners: {
				ready: function(combobox) {
					this._loadSeverities();
					},
				select: function(combobox,records) {
					this._loadData();
					},
				scope: this
			    }
			   });
		this.pulldownContainer.add(this.iterComboBox);
		},

	//for load severity part coding
	_loadSeverities: function() {
	this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
		model: 'Defect',
		field: 'Severity',
		fieldLabel: 'Severity',
		labelAlign: 'right',
		listeners: {
				ready: function(combobox) {
					this._loadSeverities();
					},
				select: function(combobox,records) {
					 this._loadData();
					},
				scope: this
			     }
			    });
	//purpose of having this is to make it nesting	
	this.pulldownContainer.add(this.severityComboBox);
	},	
 

   //Get data from rally and remark this use _loadData to sniff out value form combobox 
    _loadData: function() {
	var selectedIterRef = this.iterComboBox.getRecord().get('_ref');
	var selectedSeverityValue = this.severityComboBox.getRecord().get('value');

	console.log('selected iter', selectedIterRef);
	console.log('selected severity', selectedSeverityValue);

		var myFilters = [
				 {
				  property: 'Iteration',
				  operation: '=',
				  value: selectedIterRef
				 },
				 {
				  property: 'Severity',
				  operation: '=',
				  value: selectedSeverityValue
				 }
				};
	//at _loadData we r pulling out the filters code

	//if store exists, just load new data
	  if(this.defectStore) {
	 console.log('store exists');
	 this.defectStore.setFilter(myFilters);
	 this.defectStore.load();
	//create store
	} else {	
	  console.log('creating store');
	 //put defect store on app itself 
	  this.defectStore = Ext.create('Rally.data.wsapi.Store', { 
		model: 'Defect',
		autoLoad: true,
	 	filters: myFilters,
		listeners: {
				load: function(myStore, myData, success) {
				console.log('got data!', myStore, myData);
				if(!this.defectGrid) {
				//if we did NOT pass scope:this below, this line would be incorrectly trying to call _createGrid() on the store which doeas not exisits.
						  this._createGrid(myStore);
				}
			    },
			    scope: this //tell wsapi data store to forward pass along th app-level context into ALL listener function
			},
			fetch: ['FormattedID', 'Name', 'Severity', 'Iteration'] //look in wsapi docs online to see all fileds available!
			});
		     }
		  },
  
 

    // Create and Show a Grid of given stories
    _createGrid: function(myStoryStore) {

      this.defectGrid = Ext.create('Rally.ui.grid.Grid', {
        store: myStoryStore,
        columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
          'FormattedID', 'Name', 'Severity', 'Iteration' 
        ]
      });

      this.add(this.defectGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)


    }

});
