#define NODE_ADDON_API_DISABLE_DEPRECATED
#include <napi.h>

#include <cassert>

Napi::Value Foo(const Napi::CallbackInfo& info) {
  Napi::Env napiEnv(info.Env());
  Napi::HandleScope scope(napiEnv);
  #define napi_assert(expr) {if(!expr){Napi::Error::New(napiEnv, #expr).ThrowAsJavaScriptException();}}
  napi_assert(info[0].IsNumber());
  napi_assert(info[1].IsNumber());
  napi_assert(info[2].IsNumber());
  napi_assert(info[3].IsNumber());
  napi_assert(info[4].IsNumber());
  napi_assert(info[5].IsNumber());
  napi_assert(info[6].IsNumber());
  napi_assert(info[7].IsNumber());
  return Napi::String::New(napiEnv, "success");
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set(Napi::String::New(env, "foo"),
              Napi::Function::New(env, Foo));
  return exports;
}

NODE_API_MODULE(addon, Init)
