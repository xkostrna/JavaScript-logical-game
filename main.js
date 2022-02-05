if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/sw.js")
            .then(res => console.log("service worker registered", res))
            .catch(err => console.log("service worker not registered", err))
    })
}

const gameData = {
    gameArticle : document.querySelector("#game-article"),
    gameOption1 : document.querySelector("#option1"),
    gameOption2 : document.querySelector("#option2"),
    gameOption3 : document.querySelector("#option3"),
    gameHint : document.querySelector("#game-hint-text"),
    gameLevel : document.querySelector("#level"),
    gameAnswer : document.querySelector("#game-answer-text"),
};

const projectConstants = {
    tasksJSON : "data/tasks.json",
    optionsCssSelector : ".option",
    optionsRestriction : ".game-article",
    optionsDropzone : "#dropzone",
}

const tasksData = {
    gameTasks : [],
    usedTasksIDs : [],
    currentLevel : Number,
};

/* Task loading and behavior starts here*/
const getRandomID = (lowerBound = 1, upperBound = tasksData.gameTasks.length) => {
    return (Math.floor(Math.random() * upperBound)) + lowerBound;
}

const isTaskSolved = (id) => {
    if(tasksData.usedTasksIDs.includes(id)) {
        return true;
    } else {
        tasksData.usedTasksIDs.push(id);
        localStorage.setItem('levels-done', JSON.stringify(tasksData.usedTasksIDs));
        return false;
    }
}

const getNewTask = (id) => {
    return tasksData.gameTasks.filter(task => parseInt(task.id, 10) === id)[0];
}

const appendTaskImage = (task) => {
    const img = document.createElement("img");
    img.src = `data/images/${task.src}`;
    img.style.marginTop = "25px";
    img.style.borderRadius = "15px";
    img.width = 500;
    img.height = 400;
    gameData.gameArticle.appendChild(img);
}

const appendTaskOptions = (task) => {
    const options = task.options.split(',');
    gameData.gameOption1.innerHTML = options[0];
    gameData.gameOption2.innerHTML = options[1];
    gameData.gameOption3.innerHTML = options[2];
}

const appendTaskBonusTexts = (task) => {
    gameData.gameHint.innerHTML = task.clue;
    gameData.gameAnswer.innerHTML = `Answer : ${task.solution}`;
}

const storeCurrentTask = (task) => {
    localStorage.setItem('last-task', JSON.stringify(task));
}

const appendTask = (id) => {
    const task = getNewTask(id);
    appendTaskImage(task);
    appendTaskOptions(task);
    appendTaskBonusTexts(task);
    storeCurrentTask(task);
}

const loadFirstTask = () => {
    const id = getRandomID();
    tasksData.gameTasks = JSON.parse(localStorage.getItem('tasks'));
    tasksData.usedTasksIDs.push(id);
    appendTask(id);
}

const appendStoredTask = () => {
    const storedTask = JSON.parse(localStorage.getItem('last-task'));
    appendTaskImage(storedTask);
    appendTaskOptions(storedTask);
    appendTaskBonusTexts(storedTask);
}

const isLocalStorageSaved = () => {
    return (JSON.parse(localStorage.getItem('tasks')) !== null);
}

const loadTaskData = () => {
    tasksData.gameTasks = JSON.parse(localStorage.getItem('tasks'));
    tasksData.currentLevel = parseInt(JSON.parse(localStorage.getItem('last-level')), 10);
    if(!tasksData.currentLevel) {
        tasksData.currentLevel = 1;
    }
    gameData.gameLevel.innerHTML = `level ${tasksData.currentLevel}/11`;
    tasksData.usedTasksIDs = JSON.parse(localStorage.getItem('levels-done'));
}

const fetchTasks = (src) => {
    if(!isLocalStorageSaved()) {
        fetch(src)
            .then(res => res.json())
            .then(data => {
                localStorage.setItem('tasks', JSON.stringify(data));
                tasksData.currentLevel = 1;
                loadFirstTask();
            });
    } else {
        loadTaskData();
        appendStoredTask();
    }
}

/* Drag and drop game logic starts here */
const dragMoveListener = (event) => {
    const target = event.target;
    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

const activateTasksOptionsDraggable = (optionsCssSelector, parent) => {
    interact(optionsCssSelector).draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction : parent,
                endOnly : true
            })
        ],
        autoScroll : true,
        listeners  : {
            move : dragMoveListener,
        }
    });
}

const resetElementPositions = (element) => {
    element.style.transform = 'translate(' + 0 + 'px, ' + 0 + 'px)';
    element.setAttribute('data-x', 0);
    element.setAttribute('data-y', 0);
}

const wrongAnswerHandler = (event) => {
    gameData.gameArticle.style.border = "solid red";
    setTimeout(function () {
        gameData.gameArticle.style.border = "none";
        resetElementPositions(event.relatedTarget);
    }, 600);
}

const goToNextLevel = () => {
    let id = getRandomID();
    while(isTaskSolved(id)) {
        id = getRandomID();
    }
    const task = getNewTask(id);
    gameData.gameArticle.removeChild(gameData.gameArticle.lastChild);
    gameData.gameLevel.innerHTML = `level ${tasksData.currentLevel}/11`;
    localStorage.setItem('last-task', JSON.stringify(task));
    localStorage.setItem('last-level', JSON.stringify(tasksData.currentLevel));
    appendStoredTask();
}

const gameWon = () => {
    gameData.gameArticle.style.border = "solid gold";
    gameData.gameLevel.innerHTML = `level ${tasksData.currentLevel}/11`;
    setTimeout(function () {
        alert('Gratulujem k výhre po kliknutí na tlačídlo pokračovať sa hra reštartuje');
    }, 400);
    setTimeout(function () {
        gameData.gameArticle.style.border = "none";
        [gameData.gameOption1,
            gameData.gameOption2,
            gameData.gameOption3].forEach(resetElementPositions);
        tasksData.currentLevel = 1;
        tasksData.usedTasksIDs = [];
        goToNextLevel();
    }, 800);
}

const correctAnswerHandler = () => {
    tasksData.currentLevel += 1;
    if(tasksData.currentLevel === tasksData.gameTasks.length + 1) {
        gameWon();
    } else {
        gameData.gameArticle.style.border = "solid green";
        setTimeout(function () {
            gameData.gameArticle.style.border = "none";
            [gameData.gameOption1,
                gameData.gameOption2,
                    gameData.gameOption3].forEach(resetElementPositions);
            goToNextLevel();
        }, 600);
    }
}

const checkDrop = (event) => {
    const userChoice = event.relatedTarget.innerHTML;
    const storedTask = JSON.parse(localStorage.getItem('last-task'));
    if (userChoice !== storedTask.solution) {
        wrongAnswerHandler(event);
    } else {
        correctAnswerHandler(event);
    }
}

const activateDragAndDrop = (dropZone, acceptable) => {
    interact(dropZone).dropzone({
        accept: acceptable,
        overlap: 0.6,
        ondrop: checkDrop
    });
}

fetchTasks(projectConstants.tasksJSON);
activateTasksOptionsDraggable(projectConstants.optionsCssSelector, projectConstants.optionsRestriction);
activateDragAndDrop(projectConstants.optionsDropzone, projectConstants.optionsCssSelector);


