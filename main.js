class Bookmarklet {
  editingNo;
  info;
  exampleInfo = {
    idSelector: "#username",
    pwSelector: "#password",
    submitButton: "#button",
    infoArr: {
      1: {
        no: 1,
        id: "mail@example.com",
        password: "password"
      }
    }
  };
  template = `
        <div id="bookmarklet-outer">
            <div id="info-list" class="wrapper"></div>
            <div class="wrapper">
                <div id="add-form">
                    id:&ensp;<input type="text" id="add-id">&emsp;
                    pw:&ensp;<input type="text" id="add-pw">&emsp;
                    <button id="add-button">追加</button>
                </div>
            </div>
            <div class="wrapper">
                <div id="setting-form">
                    <p><span>idセレクタ:</span><input type="text" id="id-selector"></p>
                    <p><span>pwセレクタ:</span><input type="text" id="pw-selector"></p>
                    <p><span>formセレクタ:</span><input type="text" id="submit-button-selector"></p>
                </div>
            </div>
            <div class="wrapper button-wrapper">
                <button id="close-button">閉じる</button>
            </div>
        </div>`;
  css = `
        #bookmarklet-outer{
            border-radius: 10px;
            position: fixed;
            width: 450px;
            height: 80vh;
            overflow-y: scroll;
            top:30px;
            left:0;
            right:0;
            margin: auto;
            background-color:rgba(255,255,255,0.9);
            box-shadow: 0 0 5px 3px #ff9900;
            z-index:2000000000;
        }

        #bookmarklet-outer #add-form,
        #bookmarklet-outer #setting-form{
            margin: 10px;
            padding: 5px;
            border:solid 1px;
        }

        #bookmarklet-outer #setting-form span{
            display: inline-block;
            width:100px;
        }

        #bookmarklet-outer input{
            display: inline-block;
            width:120px;
        }

        #bookmarklet-outer .record{
            display: inline-block;
            text-align: center;
            border-radius: 5px;
            background-color: #ff9900;
            width: 70%;
            margin: 10px;
            cursor: pointer;
        }

        #bookmarklet-outer .button-wrapper{
            text-align: center;
            margin: 5px auto;
        }

        #bookmarklet-outer .save-button,
        #bookmarklet-outer .id-input,
        #bookmarklet-outer .pw-input{
            display: none;
        }
    `;

  constructor() {
    this.init();
  }

  init = () => {
    this.render();
    this.getData();
    this.setEventListner();
  };

  render = () => {
    $("head").append(`<style type="text/css">${this.css}</style>`);
    $("body").append(this.template);
  };

  getData = () => {
    this.info =
      JSON.parse(localStorage.getItem("bookmarklet-info")) || this.exampleInfo;
    Object.entries(this.info.infoArr).forEach(([i, x]) => {
      this.append(x.no, x.id, x.password);
    });
    $("#bookmarklet-outer #id-selector").val(this.info.idSelector);
    $("#bookmarklet-outer #pw-selector").val(this.info.pwSelector);
    $("#bookmarklet-outer #submit-button-selector").val(this.info.submitButton);
  };

  setEventListner = () => {
    $("body").on("click", "#bookmarklet-outer input", e => {
      e.stopPropagation();
    });
    $("body").on("click", "#bookmarklet-outer .record", e => {
      this.setAndSubmit($(e.currentTarget));
    });
    $("body").on("click", "#bookmarklet-outer .edit-button", e => {
      this.edit($(e.currentTarget));
    });
    $("body").on("click", "#bookmarklet-outer .save-button", e => {
      this.save($(e.currentTarget));
    });
    $("body").on("click", "#bookmarklet-outer .delete-button", e => {
      this.deleteInfo($(e.currentTarget));
    });
    $("#bookmarklet-outer #add-button").on("click", this.register);
    $("#bookmarklet-outer #setting-form input").on("keyup", this.settingUpdate);
    $("#bookmarklet-outer #close-button").on("click", this.close);
  };

  register = () => {
    const no = +new Date();
    const id = $("#bookmarklet-outer #add-id").val();
    const pw = $("#bookmarklet-outer #add-pw").val();
    $("#bookmarklet-outer #add-id").val(null);
    $("#bookmarklet-outer #add-pw").val(null);
    this.append(no, id, pw);
    this.info.infoArr[no] = {
      no: no,
      id: id,
      password: pw
    };
    this.saveLocalStorage();
  };

  append = (no, id, pw) => {
    const newRecordDom = $(`
            <div>
                <span class="record">
                    <input class="no" type="hidden" value="${no}" />
                    id:<span class="id">${id}</span><input class="id-input" value="${id}">&emsp;
                    pw:<span class="pw">${pw}</span><input class="pw-input" value="${pw}">
                </span>
                <button class="edit-button">編集</button>
                <button class="save-button">保存</button>
                <button class="delete-button">削除</button>
            </div>`);
    $("#info-list").append(newRecordDom);
  };

  edit = el => {
    const parent = el.parent();
    const no = parent.find(".no").val();
    this.editingNo = no;
    parent.find(".id-input").show();
    parent.find(".pw-input").show();
    parent.find(".id").hide();
    parent.find(".pw").hide();
    parent.find(".edit-button").hide();
    parent.find(".save-button").show();
  };

  save = el => {
    const parent = el.parent();
    const no = parent.find(".no").val();
    const newId = parent.find(".id-input").val();
    const newPw = parent.find(".pw-input").val();

    parent.find(".id-input").hide();
    parent.find(".pw-input").hide();
    parent.find(".id").text(newId);
    parent.find(".pw").text(newPw);
    parent.find(".id").show();
    parent.find(".pw").show();
    parent.find(".edit-button").show();
    parent.find(".save-button").hide();

    this.info.infoArr[no].id = newId;
    this.info.infoArr[no].password = newPw;
    this.saveLocalStorage();
    this.editingNo = null;
  };

  deleteInfo = el => {
    const parent = el.parent();
    const no = parent.find(".no").val();
    parent.remove();

    delete this.info.infoArr[no];
    this.saveLocalStorage();
  };

  settingUpdate = () => {
    this.info.idSelector = $("#bookmarklet-outer #id-selector").val();
    this.info.pwSelector = $("#bookmarklet-outer #pw-selector").val();
    this.info.submitButton = $(
      "#bookmarklet-outer #submit-button-selector"
    ).val();
    this.saveLocalStorage();
  };

  setAndSubmit = el => {
    if (this.editingNo == el.find(".no").val()) {
      return;
    }

    $(this.info.idSelector).val(el.find(".id").text());
    $(this.info.pwSelector).val(el.find(".pw").text());
    $(this.info.submitButton).click();
  };

  close = () => {
    $("#bookmarklet-outer").remove();
  };

  saveLocalStorage = () => {
    localStorage.setItem("bookmarklet-info", JSON.stringify(this.info));
  };
}

$(() => {
  const bookMarklet = new Bookmarklet();
});
