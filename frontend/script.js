var editing = 0;
var credit = 0;
var readonly = "False"
var showBillGates = "False"
const money = [1, 5, 10, 20, 50, 100, 200, 500];
const cap = -2000

if (new Date().getMonth() == 3 && new Date().getDate() == 1) {
   showBillGates = "True"
} else { showBillGates = "False" }
const server = "https://hebcanteentabs.onrender.com"
const port = ''
var pword = ""

try {
    for (i = 3; i < document.cookie.length; i++) {
        pword = pword + document.cookie[i];
    }
} catch (err) { pword = "" }


function upper(t) { if(t == ""){return ""}else{var r = ""; t.split(" ").forEach((i) => { r = r + " " + i.toUpperCase()[0] + i.substr(1).toLowerCase() }); return (r.substr(1)) }}

function hash(t) {
    //Simple hashing algorithm written by chatgpt
    let hash = 0;

    for (let i = 0; i < t.length; i++) {
        const charCode = t.charCodeAt(i);
        hash = (hash * 42 + charCode) & 0xffffffff;
    }

    return hash.toString(16);
}

function login() {
    const pwordvalue = document.getElementById('password').value;
    pword = pwordvalue;
    document.cookie = `pw=${pword}`
    console.log(`Trying password ${pword}`)

}
async function getTabs() {
    try {
        const data = await fetch(`${server}:${port}/get?p=${hash(pword)}`)
        if (data.status == 401 && pword != "") {
            document.getElementById("tablist").textContent = `Incorrect password. \n(If you've forgotten the password, click F12.)`
            console.log(`Send an email to jr.klump@proton.me to get the password to the app.`)
        } else {
            const tabs = await data.json()
            const status = data.status
            const tablist = document.getElementById("tablist")
            tablist.innerHTML = ""
            hide("loginbox")

            if (data.status == 418) {
                readonly = "True";
                hide("addtab")
            }
            else if (data.status == 200) {
                readonly = "False";
            }

            tabs.forEach(tab => {
                const newitem = document.createElement("button")
                if (tab.balance >= 0) {
                    newitem.style.backgroundColor = "green";
                    newitem.style.border = "2px solid darkgreen"
                }
                else {
                    newitem.style.backgroundColor = "red"
                    newitem.style.border = "2px solid darkred"
                };

                // newitem.style.backgroundColor = 
                newitem.id = tab.id;
                newitem.className = "tab-buttons";
                newitem.dataset.balance = tab.balance;
                newitem.dataset.name = tab.name;
                if (readonly == "False") {
                    newitem.onclick = () => edittab(tab.id)
                }
                if (tab.balance <= cap) {
                    newitem.textContent = tab.name + ": " + tab.balance + "🔒";
                } else {
                    newitem.textContent = tab.name + ": " + tab.balance;
                }
                tablist.appendChild(newitem)
            });
            if(showBillGates != "true"){
            hide("1")}
            return status
        }
    }
    catch (err) {
        if (pword != "") {
            document.getElementById("tablist").textContent = `Error loading for some reason.`;
            throw err
        }
    }
}

async function updatetab(bg="False") {
    ;
    await fetch(`${server}:${port}/modify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            id: editing,
            change: credit,
        })
    })
    editing = 0
    credit = 0
    getTabs()
    if(bg !="True"){
    hide("edit-popup")}
}
async function deletetab() {
    const id = editing
    if (id == 1){showBillGates = 'false';hide("1");}
    if (document.getElementById(`${id}`).dataset.balance >= 0) {
        await fetch(`${server}:${port}/delete`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id })
        })
        hide("edit-popup")
        hide("confirm-delete")
        getTabs();
    } else {
        var popup = ""
        try {
            popup = document.getElementById("alert")
            popup.textContent = ""
        }
        catch (err) {
            popup = document.createElement("div")
        }
        popup.className = "floating-box"
        popup.id = "alert"
        popup.style.display = "block"
        const text = document.createElement("h4")
        text.textContent = "Please clear debt before deleting a tab."
        popup.appendChild(text)
        const dismiss = document.createElement("button")
        dismiss.onclick = () => {
            hide("alert");
            hide("confirm-delete")
        }
        dismiss.textContent = "Ok"
        popup.appendChild(dismiss)
        document.querySelector("body").appendChild(popup)
    }
};

async function addtab() {
    const text = upper(document.getElementById("name-input").value);
    await fetch(`${server}:${port}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
    });
    document.getElementById("name-input").value = "";
    getTabs();
    hide('name-popup')
}


function initbuttons() {
    document.getElementById("buttons").innerHTML = ""
    money.forEach(amnt => {
        const container = document.getElementById("buttons");
        const subcont = document.createElement("div");
        subcont.id = `${amnt}`
        subcont.style.display = "flex";
        const add = document.createElement("button")
        add.textContent = `+${amnt}`
        add.className = "add"
        add.id = `+${amnt}`
        add.onclick = () => addto(amnt)
        add.style.display = "inline";
        subcont.appendChild(add)
        const sub = document.createElement("button")
        sub.textContent = `-${amnt}`
        sub.className = "sub"
        sub.id = `${amnt}`
        sub.onclick = () => addto(-amnt)
        sub.style.display = "inline";
        const toedit = document.getElementById(`${editing}`)
        const updated = parseInt(toedit.dataset.balance) + credit
        if ((updated - amnt) < -2000) {
            sub.style.color = "lightgrey"
            sub.style.backgroundColor = "grey"
            sub.style.border = "2px solid darkgrey"
        }
        subcont.appendChild(sub)
        container.appendChild(subcont)

    })
};
function hide(id) {
    const toggle = document.getElementById(id);
    toggle.style.display = "none";
}
function show(id) {
    const toggle = document.getElementById(id);
    toggle.style.display = "block";
}
function edittab(id) {
    show("edit-popup");
    editing = id;
    initbuttons();
    credit = 0;
    ebutton = document.getElementById(`${id}`)
    document.getElementById("edit-heading").textContent = `Editing tab: ${ebutton.dataset.name}`
    document.getElementById("balance").textContent = `Balance: ${ebutton.dataset.balance}`
    addto(0)
}
function addto(amnt) {
    const toedit = document.getElementById(`${editing}`)
    const balance = parseInt(toedit.dataset.balance)
    if (balance + credit + parseInt(amnt) >= cap) {

        credit += parseInt(amnt)
    }
    const updated = balance + credit
    document.getElementById("updated-balance").textContent = `New Balance: ${updated}`
    initbuttons()
}

document.addEventListener('DOMContentLoaded', () => {
    getTabs();
});
var autoupdate = setInterval(getTabs, 3000);
