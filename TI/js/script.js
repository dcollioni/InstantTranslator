var imagens;
var menuOriginal;
var menuTraducao;
var textoOriginal;
var textoTraduzido;
var header;
var original;
var imagemOriginal;
var imagemTraducao;
var imagemTraduzir;
var imagemInverter;
var idiomaOriginal;
var idiomaTraducao;
var legendaTraducao;
var imagemMais;
var donateButton;
var loading;
var lastQuery = '';

function Iniciar() {

    InicializarVariaveis();
    InicializarEventos();
    ObterSelecao();
}

function InicializarVariaveis() {

    imagens = [
        { id: 1, src: 'images/flags/Brazil.png', name: 'Português', language: 'pt' },
        { id: 2, src: 'images/flags/UK.png', name: 'Inglês', language: 'en' },
        { id: 3, src: 'images/flags/Spain.png', name: 'Espanhol', language: 'es' },
        { id: 4, src: 'images/flags/France.png', name: 'Francês', language: 'fr' },
        { id: 5, src: 'images/flags/Italy.png', name: 'Italiano', language: 'it' },
        { id: 6, src: 'images/flags/Germany.png', name: 'Alemão', language: 'de' },
        { id: 7, src: 'images/flags/Japan.png', name: 'Japonês', language: 'ja' }
    ];

    menuOriginal = $('#menuOriginal');
    menuTraducao = $('#menuTraducao');
    imagemOriginal = $('#imagemOriginal');
    imagemTraducao = $('#imagemTraducao');
    imagemTraduzir = $('#imagemTraduzir');
    imagemInverter = $('#imagemInverter');
    imagemMais = $('#imagemMais');
    textoOriginal = $('#textoOriginal');
    textoTraduzido = $('#textoTraduzido');
    legendaTraducao = $('#legendaTraducao');
    header = $('header');
    original = $('#original');
    donateButton = $('#donateButton');
    loading = $('#loading');

    if (!localStorage.languageFrom || localStorage.languageFrom == 'null') {
        localStorage.languageFrom = 'en';
    }
    if (!localStorage.languageTo || localStorage.languageTo == 'null') {
        localStorage.languageTo = 'pt';
    }

    idiomaOriginal = localStorage.languageFrom;
    idiomaTraducao = localStorage.languageTo;

    $(imagens).each(function (i, imagem) {
        if (imagem.language == idiomaOriginal) {
            imagemOriginal.attr('alt', imagem.id);
            imagemOriginal.attr('src', imagem.src);
            imagemOriginal.attr('title', imagem.name);
        }
        if (imagem.language == idiomaTraducao) {
            imagemTraducao.attr('alt', imagem.id);
            imagemTraducao.attr('src', imagem.src);
            imagemTraducao.attr('title', imagem.name);
        }
    });

    menuOriginal.hide();
    menuTraducao.hide();
}

var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();

function queryHasChanged() {
    
    var actualQuery = textoOriginal.val();
    actualQuery = normalizeQuery(actualQuery);
    
    var hasChanged = (actualQuery.toLowerCase() != lastQuery.toLowerCase());
    return hasChanged;
}

function normalizeQuery(query) {
    
    if (query) {
        query = query.replace(/(\r\n|\n|\r|<|>)/gm, ' ').trim();
    }

    return query;
}

function InicializarEventos() {

    textoOriginal.keyup(function () {
        
        if (queryHasChanged()) {
            
            delay(function () {
                Traduzir();
            }, 300);
        }
    });

    imagemOriginal.click(function () { ToggleMenuOriginal(); });
    imagemTraducao.click(function() { ToggleMenuTraducao(); });
    imagemTraduzir.click(function() { Traduzir(); });
    imagemInverter.click(function () { Inverter(); });
    imagemMais.click(function () { MaisTraducoes(); });

    menuOriginal.children().click(function () {

        var imagemSelecionada = imagens[this.alt - 1];

        imagemOriginal.attr('alt', imagemSelecionada.id);
        imagemOriginal.attr('src', imagemSelecionada.src);
        imagemOriginal.attr('title', imagemSelecionada.name);
        idiomaOriginal = imagemSelecionada.language;

        Traduzir();
        ToggleMenuOriginal();
    });

    menuTraducao.children().click(function() {

        var imagemSelecionada = imagens[this.alt - 1];

        imagemTraducao.attr('alt', imagemSelecionada.id);
        imagemTraducao.attr('src', imagemSelecionada.src);
        imagemTraducao.attr('title', imagemSelecionada.name);
        idiomaTraducao = imagemSelecionada.language;

        Traduzir();
        ToggleMenuTraducao();
    });

    donateButton.click(function () {
        $('#buttonPagSeguro').click();
    });
}

function ToggleMenuOriginal() {

    if (menuOriginal.is(':visible')) {

        menuOriginal.fadeOut(200);
        textoOriginal.focus();
    }
    else {

        menuOriginal.fadeIn(300);
    }
}

function ToggleMenuTraducao() {

    if (menuTraducao.is(':visible')) {

        menuTraducao.fadeOut(200);
        textoOriginal.focus();
    }
    else {

        menuTraducao.fadeIn(300);
    }
}

function ObterSelecao() {

    chrome.tabs.getSelected(null, function (tab) {

        chrome.tabs.sendRequest(tab.id, { method: "getSelection" }, function (response) {

            if (response) {
                textoOriginal.val(response.data);
                Traduzir();
            }
        });
    });
}

function Traduzir() {

    var text = textoOriginal.val();

    if (text) {
        text = normalizeQuery(text);

        loading.fadeIn(200);

        $.get('http://www.worldlingo.com/S3704.3/texttranslate',
        {
           wl_srclang: idiomaOriginal,
           wl_trglang: idiomaTraducao,
           wl_text: text
        })
        .complete(function (data) {
            if (data && data.responseText) {
                onTranslationComplete(data.responseText);
            }

            loading.fadeOut(200);
            lastQuery = text;
        });

//        $.post('https://datamarket.accesscontrol.windows.net/v2/OAuth2-13',
//            {
//                client_id: 'TradutorInstantaneo',
//	            client_secret: 'D36qcBNDopLmUz2cYpAgPZ0ZPezQEs79QeTp88gZ4hc=',
//	            scope: 'http://api.microsofttranslator.com',
//	            grant_type: 'client_credentials'
//            },
//            function (data) {
//                if (data.access_token) {
//                    $.get('http://api.microsofttranslator.com/V2/Ajax.svc/Translate',
//                    {
//                        'from': idiomaOriginal,
//                        'to': idiomaTraducao,
//                        'text': text,
//                        'contentType': "text/plain",
//                        'appId': "Bearer " + data.access_token
//                    }
//                    )
//                    .complete(function (data) {
//                        if (data && data.responseText) {
//                            onTranslationComplete(data.responseText);
//                        }
//                        loading.fadeOut(200);
//                        lastQuery = text;
//                    });
//                }
//                else {
//                    loading.fadeOut(200);
//                }
//            }
//        );
    }
    else {
        $('#textoTraduzido').text('');
    }

    function SetTranslatedValue(tValue) {
        if (tValue) {
            $("#textoTraduzido").text(tValue);
        }
    }

    function saveDefaultLanguages() {
        localStorage.languageFrom = idiomaOriginal;
        localStorage.languageTo = idiomaTraducao;
    }

    function onTranslationComplete(value) {

        if (value) {
            //value = value.substr(1, value.length - 2); // Remove first and last quotes.
            value = decodeURI(value);
        }

        SetTranslatedValue(value);
        saveDefaultLanguages();
    }
}
	
function Inverter() {

    var imgOriginal = imagens[imagemOriginal[0].alt - 1];
    var imgTraducao = imagens[imagemTraducao[0].alt - 1];

    imagemOriginal.attr('alt', imgTraducao.id);
    imagemOriginal.attr('src', imgTraducao.src);
    imagemOriginal.attr('title', imgTraducao.name);
    idiomaOriginal = imgTraducao.language;

    imagemTraducao.attr('alt', imgOriginal.id);
    imagemTraducao.attr('src', imgOriginal.src);
    imagemTraducao.attr('title', imgOriginal.name);
    idiomaTraducao = imgOriginal.language;

    Traduzir();
    textoOriginal.focus();
}

function MaisTraducoes() {

    var text = textoOriginal.val().trim();

    if (text != '') {

        var imgOriginal = imagens[imagemOriginal[0].alt - 1];
        var imgTraducao = imagens[imagemTraducao[0].alt - 1];

        var encodedText = encodeURI(text);

        var params = imgOriginal.language + '|' + imgTraducao.language + '|' + encodedText;

        window.open('http://translate.google.com/#' + params);
    }
}

function checkFocus() {
    if (!document.hasFocus()) {
        document.location.reload();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    Iniciar();

    // TODO: Remove this in future.
    if (document.hasFocus) {
        setInterval(checkFocus, 150);
    }
});