
const ps = new PerfectScrollbar('#cells', {
    wheelSpeed: 2
});

for(let i = 1; i <= 100; i++)
{
    let str = '';
    let n = i;

    while(n > 0)
    {
        let rem = n % 26;
        if(rem === 0)
        {
            str = 'Z' + str;
            n = Math.floor(n / 26) - 1;
        }
        else
        {
            str = String.fromCharCode((rem-1) + 65) + str;
            n = Math.floor(n / 26);
        }
    }

    $('#columns').append(`<div class="column-name">${str}</div>`);
    $('#rows').append(`<div class="row-name">${i}</div>`);
}

let cellData = {
    'Sheet 1': {}
};

let selectedSheet = 'Sheet 1';
let totalSheets = 1;
let lastlyAddedSheet = 1;

let defaultProperties = {
    'font-family': 'Noto Sans',
    'font-size': 14,
    'text': '',
    'bold': false,
    'italic': false,
    'underlined': false,
    'alignment': 'left',
    'color': '#444',
    'bgcolor': '#fff'
};

for(let i = 1; i <= 50; i++)
{
    let row = $('<div class="cell-row"></div>'); // createElement using jQuery
    for(let j = 1; j <= 50; j++)
    {
        row.append(`<div id="row-${i}-col-${j}" class="input-cell" contenteditable="false"></div>`);
    }

    $('#cells').append(row);
}

// fixing scroll of #columns and #rows when scrolling with perfectScrollbar

$('#cells').scroll(function(e) {
    $('#columns').scrollLeft(this.scrollLeft); // only scrollLeft exists in perfectScrollbar
    $('#rows').scrollTop(this.scrollTop); // only scrollLeft exists in perfectScrollbar
});

// dblclick event

$('.input-cell').dblclick(function(e) {
    $('.input-cell.selected').removeClass('selected');
    $(this).addClass('selected');
    $(this).attr('contenteditable', 'true');
    $(this).focus();
});

// blur event 

$('.input-cell').blur(function(e) {
    $(this).attr('contenteditable', 'false');
    updateCellData('text', $(this).text());
});

// select and unselect cells

function getRowCol(ele) {
    let arr = $(ele).attr('id').split('-');
    return [parseInt(arr[1]), parseInt(arr[3])]; // return multiple vars
}

function getNeighbours(rowId, colId) {
    let topCell = $(`#row-${rowId-1}-col-${colId}`); // getElement using jQuery
    let bottomCell = $(`#row-${rowId+1}-col-${colId}`);
    let leftCell = $(`#row-${rowId}-col-${colId-1}`);
    let rightCell = $(`#row-${rowId}-col-${colId+1}`);

    return [topCell, bottomCell, leftCell, rightCell];
}

// click event

$('.input-cell').click(function(e) {
    let [rowId, colId] = getRowCol(this); // receive multiple vars
    let [topCell, bottomCell, leftCell, rightCell] = getNeighbours(rowId, colId);
    if($(this).hasClass('selected'))
    {
        unselectCell(this, e, topCell, bottomCell, leftCell, rightCell);
    }
    else selectCell(this, e, topCell, bottomCell, leftCell, rightCell);
});

// select 
function selectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    
    // multiple selection
    if(e.ctrlKey)
    {
        // first, we want to check whether any of the 4 cells (top, bottom, left, right) are selected or not

        // bools
        let isTopSelected;
        let isBottomSelected;
        let isLeftSelected;
        let isRightSelected;

        if(topCell) isTopSelected = topCell.hasClass('selected');
        if(bottomCell) isBottomSelected = bottomCell.hasClass('selected');
        if(leftCell) isLeftSelected = leftCell.hasClass('selected');
        if(rightCell) isRightSelected = rightCell.hasClass('selected');

        // we have the information of our neighbours now
        if(isTopSelected)
        {
            $(ele).addClass('top-selected');
            topCell.addClass('bottom-selected');
        }

        if(isBottomSelected)
        {
            $(ele).addClass('bottom-selected');
            bottomCell.addClass('top-selected');
        }

        if(isLeftSelected)
        {
            $(ele).addClass('left-selected');
            leftCell.addClass('right-selected');
        }

        if(isRightSelected)
        {
            $(ele).addClass('right-selected');
            rightCell.addClass('left-selected');
        }
    }
    else // single selection
    {
        $('.input-cell.selected').removeClass('selected top-selected bottom-selected left-selected right-selected');
    }

    $(ele).addClass('selected');
    changeHeader(getRowCol(ele));
} 

function changeHeader([rowId, colId]) {
    let data;
    if(cellData[selectedSheet][rowId] && cellData[selectedSheet][rowId][colId])
    {
        data = cellData[selectedSheet][rowId][colId];
    }
    else data = defaultProperties;

    $('.alignment.selected').removeClass('selected');
    $(`.alignment[data-type="${data.alignment}"]`).addClass('selected'); // get using html attribute

    addRemoveSelectFromFontStyle(data, 'bold');
    addRemoveSelectFromFontStyle(data, 'italic');
    addRemoveSelectFromFontStyle(data, 'underlined');

    $('#fill-color').css('border-bottom', `4px solid ${data.bgcolor}`);
    $('#text-color').css('border-bottom', `4px solid ${data.color}`);
    $('#font-family').val(data['font-family']);
    $('#font-family').css('font-family', data['font-family']);
    $('#font-size').val(data['font-size']);
}

function addRemoveSelectFromFontStyle(data, property) {
    if(data[property])
    {
        $(`#${property}`).addClass('selected');
    }
    else 
    {
        $(`#${property}`).removeClass('selected');
    }
}

// unselect
function unselectCell(ele, e, topCell, bottomCell, leftCell, rightCell) {
    if(e.ctrlKey /*|| isMouseSelectionFinished*/)
    {
        let isTopSelected;
        let isBottomSelected;
        let isLeftSelected;
        let isRightSelected;

        if(topCell) isTopSelected = topCell.hasClass('selected');
        if(bottomCell) isBottomSelected = bottomCell.hasClass('selected');
        if(leftCell) isLeftSelected = leftCell.hasClass('selected');
        if(rightCell) isRightSelected = rightCell.hasClass('selected');

        if(isTopSelected)
        {
            topCell.removeClass('bottom-selected');
        }

        if(isBottomSelected)
        {
            bottomCell.removeClass('top-selected');
        }

        if(isLeftSelected)
        {
            leftCell.removeClass('right-selected');
        }

        if(isRightSelected)
        {
            rightCell.removeClass('left-selected');
        }
    }
    
    $(ele).removeClass('selected top-selected bottom-selected left-selected right-selected');
}

// select using mouse scroll

// let isMouseSelectionFinished = false;
// let isStartCellSelected = false;
// let startCell = {};
// let endCell = {};

// $('.input-cell').mousemove(function(e) {
//     e.preventDefault();
//     if(e.buttons === 1)
//     {
//         if(!isStartCellSelected)
//         {
//             let [rowId, colId] = getRowCol(this);
//             startCell = {'rowId': rowId, 'colId': colId};
//             isStartCellSelected = true;
//             let [topCell, bottomCell, leftCell, rightCell] = getNeighbours(rowId, colId);
//             selectCell($(`#row-${rowId}-col-${colId}`)[0], {'ctrlKey': true}, topCell, bottomCell, leftCell, rightCell);
//         }
//     }
// });

// $('.input-cell').mouseup(function(e) {
//     // reset
//     isStartCellSelected = false;  
//     isMouseSelectionFinished = true;
// });

// $('.input-cell').mouseenter(function(e) {
//     if(e.buttons === 1) // left click
//     {
//        let [rowId, colId] = getRowCol(this);
//        endCell = {'rowId': rowId, 'colId': colId};
//        selectAllBetweenCells(startCell, endCell); 
//     }
// });

// select cells between start and end

function selectAllBetweenCells(start, end) {
    $('.input-cell.selected').removeClass('selected top-selected bottom-selected left-selected right-selected');
    
    for(let i = Math.min(start.rowId, end.rowId); i <= Math.max(start.rowId, end.rowId); i++)
    {
        for(let j = Math.min(start.colId, end.colId); j <= Math.max(start.colId, end.colId); j++)
        {
            let [topCell, bottomCell, leftCell, rightCell] = getNeighbours(i, j);
            selectCell($(`#row-${i}-col-${j}`)[0], {'ctrlKey': true}, topCell, bottomCell, leftCell, rightCell);
        }
    }
}

$('.alignment').click(function(e) {
    let alignment = $(this).attr('data-type');
    $('.alignment.selected').removeClass('selected');
    $(this).addClass('selected');
    $('.input-cell.selected').css('text-align', alignment);
    // $('.input-cell.selected').each(function(index, data) {
    //     let [rowId, colId] = getRowCol(data);
    //     cellData[rowId-1][colId-1].alignment = alignment;
    // });
    updateCellData('alignment', alignment);
});

$('#bold').click(function(e) {
    setStyle(this, 'bold', 'font-weight', 'bold');
});

$('#italic').click(function(e) {
    setStyle(this, 'italic', 'font-style', 'italic');
});

$('#underlined').click(function(e) {
    setStyle(this, 'underlined', 'text-decoration', 'underline');
});

function setStyle(ele, property, key, value) {
    if($(ele).hasClass('selected'))
    {
        $(ele).removeClass('selected');
        $('.input-cell.selected').css(key, ''); // css removed
        // $('.input-cell.selected').each(function(index, data) {
        //     let [rowId, colId] = getRowCol(data);
        //     cellData[rowId-1][colId-1][property] = false;
        // });
        updateCellData(property, false);
    }
    else 
    {
        $(ele).addClass('selected');
        $('.input-cell.selected').css(key, value);
        // $('.input-cell.selected').each(function(index, data) {
        //     let [rowId, colId] = getRowCol(data);
        //     cellData[rowId-1][colId-1][property] = true;
        // });
        updateCellData(property, true);
    }
}

$(".pick-color").colorPick({
    'initialColor':'#444',
    'allowRecent': true,
    'recentMax': 5,
    'allowCustomColor': true,
    'palette': ["#1abc9c", "#16a085", "#2ecc71", "#27ae60", "#3498db", "#2980b9", "#9b59b6", "#8e44ad", "#34495e", "#2c3e50", "#f1c40f", "#f39c12", "#e67e22", "#d35400", "#e74c3c", "#c0392b", "#ecf0f1", "#bdc3c7", "#95a5a6", "#7f8c8d"],
    'onColorSelected': function() {
        if($(this.element.children()[1]).attr('id') == 'fill-color')
        {
            $('#fill-color').css('border-bottom', `4px solid ${this.color}`);
            $('.input-cell.selected').css('background-color', this.color);

            // update
            // $('.input-cell.selected').each((index, data) => {
            //     let [rowId, colId] = getRowCol(data);
            //     cellData[rowId - 1][colId - 1].bgcolor = this.color;
            // });

            updateCellData('bgcolor', this.color);
        }
        else 
        {
            $('#text-color').css('border-bottom', `4px solid ${this.color}`);
            $('.input-cell.selected').css('color', this.color);

            // update
            // $('.input-cell.selected').each((index, data) => {
            //     let [rowId, colId] = getRowCol(data);
            //     cellData[rowId - 1][colId - 1].color = this.color;
            // });

            updateCellData('color', this.color);
        }
    }
});

$('#fill-color').click(function(e) {
    setTimeout(() => {$(this).parent().click();}, 10); // this in arrow function refers to outer this
});

$('#text-color').click(function(e) {
    setTimeout(() => {$(this).parent().click();}, 10);
});

$('.menu-selector').change(function(e) {
    let value = $(this).val();
    let key = $(this).attr('id');
    if(key == 'font-family')
    {
        $('#font-family').css(key, value);
    }

    if(!isNaN(value)) // '20' converted to 20 and then checked
    {
        value = parseInt(value);
    }

    $('.input-cell.selected').css(key, value);

    // $('.input-cell.selected').each((index, data) => {
    //     let [rowId, colId] = getRowCol(data);
    //     cellData[rowId - 1][colId - 1][key] = value;
    // });

    updateCellData(key, value);
});

// Optimizing storage of cell data
function updateCellData(property, value) {
    if(value != defaultProperties[property]) 
    {
        $('.input-cell.selected').each(function(index, data) {
            let [rowId, colId] = getRowCol(data);
            if(cellData[selectedSheet][rowId] == undefined)
            {
                cellData[selectedSheet][rowId] = {};
                cellData[selectedSheet][rowId][colId] = {...defaultProperties};
                cellData[selectedSheet][rowId][colId][property] = value;
            }
            else if(cellData[selectedSheet][rowId][colId] == undefined)
            {
                cellData[selectedSheet][rowId][colId] = {...defaultProperties};
                cellData[selectedSheet][rowId][colId][property] = value;
            }
            else 
            {
                cellData[selectedSheet][rowId][colId][property] = value;
            }
        });
    }
    else
    {
        $('.input-cell.selected').each(function(index, data) {
            let [rowId, colId] = getRowCol(data);
            if(cellData[selectedSheet][rowId] && cellData[selectedSheet][rowId][colId])
            {
                cellData[selectedSheet][rowId][colId][property] = value;
                if(JSON.stringify(cellData[selectedSheet][rowId][colId]) == JSON.stringify(defaultProperties))
                {
                    delete cellData[selectedSheet][rowId][colId];
                    if(Object.keys(cellData[selectedSheet][rowId]).length == 0)
                    {
                        delete cellData[selectedSheet][rowId];
                    }
                }
            }
        });
    }
}

$('.container').click(function(e) {
    if(e.target.classList[0] !== 'option')
    {
        $('.sheet-options-modal').remove();
    }
});

// attaching event listeners to HTML elements 
function addSheetEvents() {
    $('.sheet-tab.selected').on('contextmenu', function(e) {
        e.preventDefault();

        if(!$(this).hasClass('selected'))
        {
            $('.sheet-tab.selected').removeClass('selected');
            $(this).addClass('selected');
            selectSheet();
        }

        $('.sheet-options-modal').remove();
    
        let modal = $(`<div class="sheet-options-modal">
                <div class="option sheet-rename">Rename</div>
                <div class="option sheet-delete">Delete</div>
        </div>`);
    
        modal.css({'left': e.pageX});
        $('.sheet-bar').append(modal);
        
        $('.sheet-rename').click(function(e) {
            let renameModal = $(`<div class="sheet-modal-parent">
            <div class="sheet-rename-modal">
                    <div class="sheet-modal-title">Rename Sheet</div>
                    <div class="sheet-modal-input-container">
                        <span class="sheet-modal-input-title">Rename to:</span>
                        <input class="sheet-modal-input" type="text" />
                    </div>
                    <div class="sheet-modal-confirmation">
                        <div class="button yes-button">OK</div>
                        <div class="button no-button">Cancel</div>
                    </div>
            </div>`);

            $('.sheet-options-modal').remove();
            $('.container').append(renameModal);
            
            $('.no-button').click(() => {$('.sheet-modal-parent').remove()});

            $('.yes-button').click(renameSheet);
        });
    });

    $('.sheet-tab.selected').click(function (e) {
        if($(this).hasClass('selected')) return;
        $('.sheet-tab.selected').removeClass('selected');
        $(this).addClass('selected');
        selectSheet();
    });
}

addSheetEvents();

$('.add-sheet').click(function(e) {
    lastlyAddedSheet++;
    totalSheets++;
    cellData[`Sheet ${lastlyAddedSheet}`] = {};

    $('.sheet-tab-container').append(`<div class="sheet-tab selected">Sheet ${lastlyAddedSheet}</div>`);
    
    $('.sheet-tab.selected').removeClass('selected');
    $('.sheet-tab:last-child').addClass('selected');
    addSheetEvents(); // adding event listeners on newly added sheet

    selectSheet();
});

function selectSheet() {
    emptyPreviousSheet();
    selectedSheet = $('.sheet-tab.selected').text();
    loadCurrentSheet();
    if(!$('#row-1-col-1').hasClass('selected')) $('#row-1-col-1').click(); // resets header as well
}

function emptyPreviousSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for(let i of rowKeys)
    {
        let colKeys = Object.keys(cellData[selectedSheet][i]);
        for(let j of colKeys)
        {
            let cell = $(`#row-${parseInt(i)}-col-${parseInt(j)}`);

            // only changed on UI, css reset
            cell.text(''); 
            cell.css({
                'font-family': 'Noto Sans',
                'font-size': '14px',
                'background-color': '#fff',
                'color': '#444',
                'font-weight': '',
                'font-style': '',
                'text-decoration': '',
                'text-align': 'left'
            });
        }
    } 
}

function loadCurrentSheet() {
    let data = cellData[selectedSheet];
    let rowKeys = Object.keys(data);
    for(let i of rowKeys)
    {
        let colKeys = Object.keys(cellData[selectedSheet][i]);
        for(let j of colKeys)
        {
            let cell = $(`#row-${parseInt(i)}-col-${parseInt(j)}`);
            cell.text(cellData[selectedSheet][i][j].text);
            cell.css({
                'font-family': cellData[selectedSheet][i][j]['font-family'],
                'font-size': cellData[selectedSheet][i][j]['font-size'],
                'background-color': cellData[selectedSheet][i][j].bgcolor,
                'color': cellData[selectedSheet][i][j].color,
                'font-weight': cellData[selectedSheet][i][j].bold ? 'bold' : '',
                'font-style': cellData[selectedSheet][i][j].italic ? 'italic' : '',
                'text-decoration': cellData[selectedSheet][i][j].underlined ? 'underline' : '',
                'text-align': cellData[selectedSheet][i][j].alignment
            });
        }
    }
}

function renameSheet() {
    let newSheetName = $('.sheet-modal-input').val();
    if(newSheetName && !Object.keys(cellData).includes(newSheetName))
    {
        cellData[newSheetName] = cellData[selectedSheet];
        delete cellData[selectedSheet];
        selectedSheet = newSheetName;
        $('.sheet-tab.selected').text(newSheetName);
        $('.sheet-modal-parent').remove();
    }
    else
    {
        $('.rename-error').remove();
        $('.sheet-modal-input-container').append(`<div class="rename-error">* Sheet Name is not valid or Sheet already exists!</div>`)
    }
}